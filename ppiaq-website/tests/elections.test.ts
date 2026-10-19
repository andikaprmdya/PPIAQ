import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import EmbeddedPostgres from 'embedded-postgres';
import type { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

let cluster: EmbeddedPostgres;
let directory: string;
let db: PrismaClient;
let service: typeof import('../lib/elections/service');
let rules: typeof import('../lib/elections/rules');
let tokens: typeof import('../lib/elections/tokens');
let mail: typeof import('../lib/elections/mail');
let session: typeof import('../lib/auth/session');
let adminId: string;
let ordinaryId: string;
let associateId: string;
let expiredId: string;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'ppiaq-election-tests-'));
  const reservation = createServer();
  await new Promise<void>(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = (reservation.address() as { port: number }).port;
  await new Promise<void>(resolve => reservation.close(() => resolve()));
  cluster = new EmbeddedPostgres({ databaseDir: join(directory, 'pg'), port, user: 'postgres', password: 'local-election-tests', persistent: false, onLog() {}, onError() {} });
  await cluster.initialise(); await cluster.start();
  process.env.DATABASE_URL = `postgresql://postgres:local-election-tests@127.0.0.1:${port}/postgres`;
  process.env.AUTH_SECRET = 'only-for-isolated-election-tests-0123456789';
  process.env.ELECTION_TOKEN_SECRET = 'only-for-isolated-election-tokens-0123456789';
  process.env.BREVO_API_KEY = 'mock-key-never-used-with-a-real-provider';
  process.env.ELECTION_SITE_URL = 'https://ppiaq.example';
  const client = cluster.getPgClient(); await client.connect();
  const root = join(process.cwd(), 'prisma/migrations');
  for (const path of (await readdir(root)).sort()) {
    if (path === 'migration_lock.toml') continue;
    await client.query(await readFile(join(root, path, 'migration.sql'), 'utf8'));
  }
  await client.end();
  db = (await import('../lib/database/prisma')).prisma;
  service = await import('../lib/elections/service'); rules = await import('../lib/elections/rules');
  tokens = await import('../lib/elections/tokens'); mail = await import('../lib/elections/mail');
  session = await import('../lib/auth/session');
}, { timeout: 120000 });

after(async () => {
  if (db) await db.$disconnect();
  if (cluster) await cluster.stop();
  if (directory) await rm(directory, { recursive: true, force: true });
});

beforeEach(async () => {
  await db.electionBallot.deleteMany();
  await db.election.deleteMany();
  await db.user.deleteMany();
  const basic = {
    password: 'test-hash', nationality: 'Indonesia', educationLevel: 'S1', university: 'UQ', major: 'Test', birthDate: '2000-01-01',
    membershipType: 'ORDINARY' as const, status: 'APPROVED' as const, paymentProofUrl: '',
    dateJoined: new Date(Date.now() - 100 * 86400000), membershipTermEnds: new Date(Date.now() + 100 * 86400000),
  };
  const admin = await db.user.create({ data: { ...basic, firstName: 'Election', lastName: 'Admin', email: 'admin@example.test', role: 'ADMIN', memberNo: 'ADMIN-1' } });
  const ordinary = await db.user.create({ data: { ...basic, firstName: 'Ordinary', lastName: 'Voter', email: 'ordinary@example.test', memberNo: 'MEMBER-1' } });
  const associate = await db.user.create({ data: { ...basic, firstName: 'Associate', lastName: 'Voter', email: 'associate@example.test', membershipType: 'ASSOCIATE', memberNo: null } });
  const expired = await db.user.create({ data: { ...basic, firstName: 'Expired', lastName: 'Member', email: 'expired@example.test', membershipTermEnds: new Date(Date.now() - 86400000) } });
  adminId = admin.id; ordinaryId = ordinary.id; associateId = associate.id; expiredId = expired.id;
});

function input(ids = [ordinaryId, associateId]) {
  return {
    title: 'PPIAQ Test Election', description: 'An isolated test election',
    opensAt: new Date(Date.now() - 60000).toISOString(), closesAt: new Date(Date.now() + 3600000).toISOString(),
    allowAbstain: true, emailSubject: rules.DEFAULT_ELECTION_SUBJECT, emailBody: rules.DEFAULT_ELECTION_BODY,
    candidates: [{ name: 'Candidate A', manifesto: 'Programme A' }, { name: 'Candidate B', manifesto: 'Programme B' }],
    voterUserIds: ids, revision: 0,
  };
}

async function draft(ids?: string[]) {
  const election = await service.createElection(adminId);
  await service.saveElection(election.id, input(ids));
  return service.electionDetail(election.id);
}

async function published(ids?: string[]) {
  const election = await draft(ids);
  await service.publishElection(election.id, election.revision, true);
  const voters = await db.electionVoter.findMany({ where: { electionId: election.id }, orderBy: { name: 'asc' } });
  return { election, voters, token: tokens.votingToken(voters[0]) };
}

const rejectsWith = (status: number) => (error: unknown) => error instanceof rules.ElectionError && error.status === status;
const acceptedFetch = (() => {
  const send = (async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    return Response.json({ messageIds: body.messageVersions.map((_: unknown, index: number) => `mock-${index}`) }, { status: 201 });
  }) as typeof fetch;
  return send;
})();

test('financial eligibility includes active ordinary and associate; excludes expired and pending members', async () => {
  const members = await service.electionMembers();
  assert.equal(members.find(member => member.id === ordinaryId)?.eligible, true);
  assert.equal(members.find(member => member.id === associateId)?.eligible, true);
  assert.equal(members.find(member => member.id === expiredId)?.eligible, false);
  await db.user.update({ where: { id: ordinaryId }, data: { status: 'PENDING' } });
  assert.equal((await service.electionMembers()).find(member => member.id === ordinaryId)?.eligible, false);
});

test('signed sessions reject tampering, expiry and email-cookie impersonation', () => {
  const user = { id: 'test-admin', email: 'admin@example.test', password: 'hashed-password', role: 'ADMIN' };
  const signed = session.createSession(user, 1000);
  assert.equal(session.verifySession(signed, 2000)?.id, user.id);
  assert.equal(session.verifySession(signed, 1000 + session.SESSION_SECONDS * 1000), null);
  const parts = signed.split('.');
  const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString()); payload.id = 'another-user';
  assert.equal(session.verifySession(Buffer.from(JSON.stringify(payload)).toString('base64url') + '.' + parts[1], 2000), null);
  assert.equal(session.verifySession('admin@example.test', 2000), null);
});

test('origin protection accepts the real local Host and rejects cross-origin or missing origins', async () => {
  const { requireSameOrigin } = await import('../lib/elections/http');
  const request = (origin?: string) => new NextRequest('http://127.0.0.1:3141/api/admin/elections', {
    method: 'POST', headers: { host: '127.0.0.1:3141', ...(origin ? { origin } : {}) },
  });
  assert.doesNotThrow(() => requireSameOrigin(request('http://127.0.0.1:3141')));
  assert.throws(() => requireSameOrigin(request('https://wrong.example')), rejectsWith(403));
  assert.throws(() => requireSameOrigin(request()), rejectsWith(403));
});

test('create, edit and delete drafts never enqueue or send invitations', async () => {
  const election = await draft();
  assert.equal(election.status, 'DRAFT'); assert.equal(election.voters.length, 2);
  assert.equal(await db.electionMailBatch.count(), 0);
  assert.equal(await db.electionVoter.count({ where: { tokenHash: { not: null } } }), 0);
  await service.deleteElection(election.id, election.revision);
  assert.equal(await db.election.count(), 0); assert.equal(await db.electionVoter.count(), 0);
});

test('draft validation rejects duplicate enrollment, inactive members and unsafe email placeholders', async () => {
  const { id } = await service.createElection(adminId);
  await assert.rejects(service.saveElection(id, input([ordinaryId, ordinaryId])), rejectsWith(400));
  await assert.rejects(service.saveElection(id, input([expiredId])), rejectsWith(400));
  await assert.rejects(service.saveElection(id, { ...input(), emailBody: 'No private voting link is present here' }), rejectsWith(400));
  await assert.rejects(service.saveElection(id, { ...input(), emailBody: rules.DEFAULT_ELECTION_BODY + '{{password}}' }), rejectsWith(400));
  await db.user.update({ where: { id: associateId }, data: { memberNo: 'member-1' } });
  await assert.rejects(service.saveElection(id, input()), rejectsWith(400));
  assert.equal((await service.electionDetail(id)).revision, 0);
});

test('stale editor revisions cannot overwrite or delete a newer draft', async () => {
  const election = await draft();
  await assert.rejects(service.saveElection(election.id, { ...input(), title: 'Stale overwrite' }), rejectsWith(409));
  await assert.rejects(service.deleteElection(election.id, 0), rejectsWith(409));
  assert.equal((await service.electionDetail(election.id)).title, 'PPIAQ Test Election');
});

test('publish requires confirmed financial roll, schedule, candidates and an email service', async () => {
  const election = await draft();
  await assert.rejects(service.publishElection(election.id, 1, false), rejectsWith(400));
  const key = process.env.BREVO_API_KEY; delete process.env.BREVO_API_KEY;
  try { await assert.rejects(service.publishElection(election.id, 1, true), rejectsWith(503)); }
  finally { process.env.BREVO_API_KEY = key; }
  await db.election.update({ where: { id: election.id }, data: { closesAt: null } });
  await assert.rejects(service.publishElection(election.id, 1, true), rejectsWith(400));
  assert.equal((await service.electionDetail(election.id)).status, 'DRAFT');
  assert.equal(await db.electionMailBatch.count(), 0);
});

test('publish freezes the roster and generates distinct unguessable credentials without exposing them to admins', async () => {
  const { election, voters } = await published();
  assert.equal(new Set(voters.map(voter => voter.tokenHash)).size, 2);
  assert.ok(voters.every(voter => voter.tokenHash?.length === 64));
  assert.ok(voters.every(voter => tokens.votingToken(voter).length === 43));
  assert.ok(voters.find(voter => voter.userId === ordinaryId)?.voterId === 'MEMBER-1');
  assert.match(voters.find(voter => voter.userId === associateId)!.voterId, /^V-/);
  const json = JSON.stringify(await service.electionDetail(election.id));
  assert.ok(!json.includes('tokenHash') && !json.includes('tokenNonce'));
  await assert.rejects(service.saveElection(election.id, { ...input(), revision: 2 }), rejectsWith(409));
  await assert.rejects(service.deleteElection(election.id, 2), rejectsWith(409));
  await assert.rejects(service.publishElection(election.id, 2, true), rejectsWith(409));
});

test('concurrent submissions consume exactly one vote', async () => {
  const { election, token, voters } = await published();
  const attempts = await Promise.allSettled(Array.from({ length: 15 }, () => service.castBallot(election.id, token, election.candidates[0].id)));
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
  for (const result of attempts) if (result.status === 'rejected') assert.ok(rejectsWith(409)(result.reason));
  assert.equal(await db.electionBallot.count({ where: { electionId: election.id } }), 1);
  assert.equal((await db.electionVoter.findUnique({ where: { id: voters[0].id } }))?.hasVoted, true);
});

test('a ballot insert failure rolls back the consumed invitation', async () => {
  const { election, token, voters } = await published();
  await db.$executeRawUnsafe(`CREATE FUNCTION reject_test_ballot() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test rollback'; END; $$`);
  await db.$executeRawUnsafe(`CREATE TRIGGER reject_test_ballot BEFORE INSERT ON election_ballots FOR EACH ROW EXECUTE FUNCTION reject_test_ballot()`);
  try {
    await assert.rejects(service.castBallot(election.id, token, election.candidates[0].id));
    assert.equal((await db.electionVoter.findUnique({ where: { id: voters[0].id } }))?.hasVoted, false);
    assert.equal(await db.electionBallot.count(), 0);
  } finally {
    await db.$executeRawUnsafe('DROP TRIGGER reject_test_ballot ON election_ballots');
    await db.$executeRawUnsafe('DROP FUNCTION reject_test_ballot()');
  }
  await service.castBallot(election.id, token, election.candidates[0].id);
});

test('foreign candidates, wrong tokens and disabled abstentions cannot consume an invitation', async () => {
  const first = await published(); const second = await published();
  await assert.rejects(service.castBallot(first.election.id, first.token, second.election.candidates[0].id), rejectsWith(400));
  await assert.rejects(service.castBallot(first.election.id, second.token, first.election.candidates[0].id), rejectsWith(404));
  await db.election.update({ where: { id: first.election.id }, data: { allowAbstain: false } });
  await assert.rejects(service.castBallot(first.election.id, first.token, null), rejectsWith(400));
  assert.equal(await db.electionBallot.count(), 0);
  await db.election.update({ where: { id: first.election.id }, data: { allowAbstain: true } });
  await service.castBallot(first.election.id, first.token, null);
});

test('opening and closing times are enforced on the server', async () => {
  const { election, token } = await published();
  await db.election.update({ where: { id: election.id }, data: { opensAt: new Date(Date.now() + 60000) } });
  await assert.rejects(service.castBallot(election.id, token, election.candidates[0].id), rejectsWith(409));
  await db.election.update({ where: { id: election.id }, data: { opensAt: new Date(Date.now() - 120000), closesAt: new Date(Date.now() - 60000) } });
  await assert.rejects(service.castBallot(election.id, token, election.candidates[0].id), rejectsWith(409));
  assert.equal(await db.electionBallot.count(), 0);
});

test('results stay hidden until closure; ballots retain no voter identity or individual timestamp', async () => {
  const { election, voters } = await published();
  await service.castBallot(election.id, tokens.votingToken(voters[0]), election.candidates[0].id);
  await service.castBallot(election.id, tokens.votingToken(voters[1]), null);
  assert.equal((await service.electionDetail(election.id)).results, null);
  await service.endElection(election.id, 'CLOSED');
  const detail = await service.electionDetail(election.id);
  assert.equal(detail.results?.total, 2); assert.equal(detail.results?.abstentions, 1);
  assert.equal(detail.results?.candidates[0].votes, 1);
  const columns = await db.$queryRaw<{ column_name: string }[]>`SELECT column_name FROM information_schema.columns WHERE table_name = 'election_ballots'`;
  assert.deepEqual(columns.map(column => column.column_name).sort(), ['candidateId', 'electionId', 'id']);
  assert.ok(detail.voters.every(voter => !('candidateId' in voter) && !('votedAt' in voter)));
  const policies = await db.$queryRaw<{ relrowsecurity: boolean }[]>`SELECT relrowsecurity FROM pg_class WHERE relname IN ('elections','election_candidates','election_voters','election_ballots','election_mail_batches')`;
  assert.equal(policies.length, 5); assert.ok(policies.every(table => table.relrowsecurity));
});

test('cancellation stops voting and preserves all existing ballots', async () => {
  const { election, voters, token } = await published();
  await service.castBallot(election.id, token, election.candidates[0].id);
  await service.endElection(election.id, 'CANCELLED');
  await assert.rejects(service.castBallot(election.id, tokens.votingToken(voters[1]), election.candidates[1].id), rejectsWith(409));
  assert.equal(await db.electionBallot.count(), 1);
  assert.equal(await mail.retryElectionMail(election.id), false);
});

test('private batch emails have one recipient each and concurrent workers do not duplicate a batch', async () => {
  const { election, voters } = await published();
  const requests: Record<string, unknown>[] = [];
  const fake = (async (url, init) => {
    const body = JSON.parse(String(init?.body)); requests.push(body);
    for (const version of body.messageVersions) {
      assert.equal(version.to.length, 1); assert.ok(!version.cc && !version.bcc);
      assert.match(version.htmlContent, /#token=/);
    }
    assert.equal(body.to, undefined);
    return acceptedFetch(url, init);
  }) as typeof fetch;
  await Promise.all([mail.dispatchElectionMail(election.id, fake), mail.dispatchElectionMail(election.id, fake)]);
  assert.equal(requests.length, 1);
  assert.equal((await db.electionMailBatch.findFirst())?.status, 'SENT');
  for (const voter of voters) assert.ok(JSON.stringify(requests).includes(tokens.votingToken(voter)));
  assert.equal(await db.electionBallot.count(), 0);
});

test('failed mail remains visible and retries preserve the same single-use credentials', async () => {
  const { election, token } = await published();
  const failed = (async () => Response.json({ code: 'unavailable' }, { status: 503 })) as typeof fetch;
  await mail.dispatchElectionMail(election.id, failed);
  assert.equal((await db.electionMailBatch.findFirst())?.status, 'FAILED');
  assert.equal(await mail.retryElectionMail(election.id), true);
  let sent = 0;
  await mail.dispatchElectionMail(election.id, (async (url, init) => { sent++; assert.ok(String(init?.body).includes(token)); return acceptedFetch(url, init); }) as typeof fetch);
  await mail.retryElectionMail(election.id);
  await mail.dispatchElectionMail(election.id, (async () => { sent++; throw new Error('Should not resend'); }) as typeof fetch);
  assert.equal(sent, 1); assert.equal((await db.electionMailBatch.findFirst())?.status, 'SENT');
});

test('a roll larger than one email batch sends every member separately exactly once', async () => {
  const base = await db.user.findUniqueOrThrow({ where: { id: ordinaryId } });
  await db.user.createMany({ data: Array.from({ length: 101 }, (_, index) => ({
    firstName: 'Bulk', lastName: `Voter ${index}`, email: `bulk-${index}@example.test`, memberNo: `BULK-${index}`,
    password: base.password, nationality: base.nationality, educationLevel: base.educationLevel,
    university: base.university, major: base.major, birthDate: base.birthDate, paymentProofUrl: '',
    membershipType: 'ORDINARY' as const, status: 'APPROVED' as const,
    dateJoined: base.dateJoined, membershipTermEnds: base.membershipTermEnds,
  })) });
  const ids = (await db.user.findMany({ where: { id: { notIn: [adminId, expiredId] } }, select: { id: true } })).map(member => member.id);
  const { election } = await published(ids);
  const recipients: string[] = [];
  let batches = 0;
  await mail.dispatchElectionMail(election.id, (async (url, init) => {
    const body = JSON.parse(String(init?.body)); batches++;
    assert.ok(body.messageVersions.length <= 100);
    for (const version of body.messageVersions) { assert.equal(version.to.length, 1); recipients.push(version.to[0].email); }
    return acceptedFetch(url, init);
  }) as typeof fetch);
  assert.equal(batches, 2); assert.equal(recipients.length, 103); assert.equal(new Set(recipients).size, 103);
  assert.equal(await db.electionMailBatch.count({ where: { status: 'SENT' } }), 2);
});

test('an interrupted batch lease is recoverable and provider idempotency acknowledgements are accepted', async () => {
  const { election } = await published();
  await db.electionMailBatch.updateMany({ data: { status: 'SENDING', lockedUntil: new Date(Date.now() - 1000) } });
  await mail.dispatchElectionMail(election.id, (async () => Response.json({ code: 'duplicate_parameter' }, { status: 400 })) as typeof fetch);
  assert.equal((await db.electionMailBatch.findFirst())?.status, 'SENT');
});

test('resending a lost invitation preserves its token and cannot issue another vote after use', async () => {
  const { election, voters, token } = await published();
  await mail.dispatchElectionMail(election.id, acceptedFetch);
  await mail.resendVoterInvitation(election.id, voters[0].id);
  const updated = await db.electionVoter.findUniqueOrThrow({ where: { id: voters[0].id } });
  assert.equal(tokens.votingToken(updated), token);
  assert.equal(updated.hasVoted, false);
  await mail.dispatchElectionMail(election.id, acceptedFetch);
  await service.castBallot(election.id, token, election.candidates[0].id);
  await assert.rejects(mail.resendVoterInvitation(election.id, voters[0].id), rejectsWith(409));
  assert.equal(await db.electionBallot.count(), 1);
});

test('rotating the token secret fails visibly instead of emailing unusable credentials', async () => {
  const { election } = await published();
  const original = process.env.ELECTION_TOKEN_SECRET;
  process.env.ELECTION_TOKEN_SECRET = 'a-different-key-that-is-longer-than-thirty-two-characters';
  try {
    await mail.dispatchElectionMail(election.id, (async () => { assert.fail('Changed tokens must not be emailed'); }) as typeof fetch);
    assert.equal((await db.electionMailBatch.findFirst())?.errorCode, 'TOKEN_SECRET_CHANGED');
  } finally { process.env.ELECTION_TOKEN_SECRET = original; }
});

test('email preview escapes editor/member content and never contains a usable voting credential', () => {
  const preview = mail.invitationPreview({ ...input(), title: '<script>alert(1)</script>', emailBody: rules.DEFAULT_ELECTION_BODY + '<img src=x onerror=alert(1)>' });
  assert.ok(!preview.html.includes('<script>') && !preview.html.includes('<img src=x'));
  assert.ok(preview.html.includes('&lt;script&gt;'));
  assert.ok(preview.html.includes('#token=EXAMPLE'));
});
