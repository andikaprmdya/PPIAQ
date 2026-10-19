import { randomBytes, randomUUID } from 'node:crypto';
import { Election, Prisma } from '@prisma/client';
import { prisma } from '../database/prisma';
import { DEFAULT_ELECTION_BODY, DEFAULT_ELECTION_SUBJECT, ElectionError, membershipEligibility, validateDraft } from './rules';
import { tokenHash, votingToken, votingUrl } from './tokens';

const memberSelect = {
  id: true, firstName: true, lastName: true, email: true, memberNo: true,
  university: true, nationality: true, membershipType: true, status: true,
  dateJoined: true, approvedAt: true, createdAt: true, membershipTermEnds: true,
} satisfies Prisma.UserSelect;

type Tx = Prisma.TransactionClient;

async function lockedElection(tx: Tx, id: string, shared = false) {
  const rows = await tx.$queryRaw<Election[]>(Prisma.sql`
    SELECT * FROM elections WHERE id = ${id} ${shared ? Prisma.sql`FOR SHARE` : Prisma.sql`FOR UPDATE`}
  `);
  if (!rows[0]) throw new ElectionError(404, 'Election not found');
  return rows[0];
}

function requireDraft(election: Election, revision: number) {
  if (election.status !== 'DRAFT') throw new ElectionError(409, 'Published elections are locked. Candidates and the voter roll cannot be changed.');
  if (election.revision !== revision) throw new ElectionError(409, 'This draft changed in another tab. Reload before editing.');
}

async function selectedMembers(tx: Tx, ids: string[], at: Date) {
  const members = await tx.user.findMany({ where: { id: { in: ids } }, select: memberSelect });
  if (members.length !== ids.length) throw new ElectionError(400, 'Some selected members no longer exist');
  const emails = new Set<string>();
  const voterIds = new Set<string>();
  return members.map(member => {
    const eligibility = membershipEligibility(member, at);
    if (!eligibility.eligible) throw new ElectionError(400, `${member.firstName} ${member.lastName}: ${eligibility.reason}`);
    const email = member.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ElectionError(400, 'A selected member has an invalid email');
    const registeredId = member.memberNo?.trim().toUpperCase();
    const voterId = registeredId && !['N/A', 'NA', 'NONE', '-'].includes(registeredId)
      ? registeredId : `V-${randomBytes(8).toString('hex').toUpperCase()}`;
    if (emails.has(email) || voterIds.has(voterId)) throw new ElectionError(400, 'Duplicate email or membership ID in voter roll. Correct the member records first.');
    emails.add(email); voterIds.add(voterId);
    return { userId: member.id, email, voterId, name: `${member.firstName} ${member.lastName}`.trim() };
  });
}

export async function electionMembers(at = new Date()) {
  const members = await prisma.user.findMany({ select: memberSelect, orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }] });
  return members.map(member => ({
    id: member.id, firstName: member.firstName, lastName: member.lastName,
    email: member.email, memberNo: member.memberNo, university: member.university,
    membershipType: member.membershipType, ...membershipEligibility(member, at),
  }));
}

export function createElection(adminId: string) {
  return prisma.election.create({ data: {
    title: 'Pemilihan Presiden PPIAQ',
    description: 'Pilih Presiden PPIAQ untuk periode berikutnya. Lengkapi jadwal, kandidat, dan daftar anggota finansial sebelum publish.',
    emailSubject: DEFAULT_ELECTION_SUBJECT, emailBody: DEFAULT_ELECTION_BODY, createdBy: adminId,
  }, select: { id: true } });
}

export function listElections() {
  return prisma.election.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, status: true, opensAt: true, closesAt: true,
      revision: true, _count: { select: { voters: true, ballots: true, candidates: true } },
    },
  });
}

export async function electionDetail(id: string) {
  const election = await prisma.election.findUnique({ where: { id }, select: {
    id: true, title: true, description: true, status: true, opensAt: true, closesAt: true,
    emailSubject: true, emailBody: true, allowAbstain: true, revision: true,
    publishedAt: true, closedAt: true, financialConfirmedAt: true,
    candidates: { orderBy: { order: 'asc' }, select: { id: true, name: true, manifesto: true, order: true } },
    voters: { orderBy: { name: 'asc' }, select: {
      id: true, userId: true, voterId: true, name: true, email: true, hasVoted: true,
      mailBatch: { select: { status: true, errorCode: true, acceptedAt: true, lockedUntil: true } },
    } },
    _count: { select: { voters: true, ballots: true } },
  } });
  if (!election) throw new ElectionError(404, 'Election not found');
  const ended = election.status === 'CLOSED' || election.status === 'CANCELLED' ||
    (election.status === 'PUBLISHED' && !!election.closesAt && election.closesAt <= new Date());
  const counts = ended ? await prisma.electionBallot.groupBy({
    by: ['candidateId'], where: { electionId: id }, _count: { _all: true },
  }) : null;
  return {
    ...election,
    results: counts ? {
      candidates: election.candidates.map(candidate => ({
        id: candidate.id, name: candidate.name,
        votes: counts.find(count => count.candidateId === candidate.id)?._count._all || 0,
      })),
      abstentions: counts.find(count => count.candidateId === null)?._count._all || 0,
      total: counts.reduce((sum, count) => sum + count._count._all, 0),
    } : null,
  };
}

export async function saveElection(id: string, input: unknown) {
  const data = validateDraft(input);
  await prisma.$transaction(async tx => {
    const election = await lockedElection(tx, id);
    requireDraft(election, data.revision);
    const opensAt = data.opensAt ? new Date(data.opensAt) : null;
    const closesAt = data.closesAt ? new Date(data.closesAt) : null;
    const members = await selectedMembers(tx, data.voterUserIds, opensAt || new Date());
    await tx.electionVoter.deleteMany({ where: { electionId: id } });
    await tx.electionCandidate.deleteMany({ where: { electionId: id } });
    if (members.length) await tx.electionVoter.createMany({ data: members.map(member => ({
      ...member, electionId: id, tokenNonce: randomBytes(24).toString('hex'),
    })) });
    if (data.candidates.length) await tx.electionCandidate.createMany({
      data: data.candidates.map((candidate, order) => ({ ...candidate, electionId: id, order })),
    });
    await tx.election.update({ where: { id }, data: {
      title: data.title, description: data.description, opensAt, closesAt,
      emailSubject: data.emailSubject, emailBody: data.emailBody,
      allowAbstain: data.allowAbstain, revision: { increment: 1 },
    } });
  }, { timeout: 20000 });
}

export async function deleteElection(id: string, revision: number) {
  await prisma.$transaction(async tx => {
    const election = await lockedElection(tx, id);
    requireDraft(election, revision);
    await tx.election.delete({ where: { id } });
  });
}

export async function publishElection(id: string, revision: number, confirmed: boolean) {
  if (!confirmed) throw new ElectionError(400, 'Confirm that every tagged member is financial and eligible');
  if (!process.env.BREVO_API_KEY) throw new ElectionError(503, 'Email service is not configured. The election has not been published.');
  await prisma.$transaction(async tx => {
    const election = await lockedElection(tx, id);
    requireDraft(election, revision);
    const now = new Date();
    if (!election.opensAt || !election.closesAt || election.closesAt <= election.opensAt || election.closesAt <= now) {
      throw new ElectionError(400, 'Set a valid opening time and a future closing time');
    }
    const candidates = await tx.electionCandidate.count({ where: { electionId: id } });
    if (candidates < 2) throw new ElectionError(400, 'Add at least two candidates before publishing');
    const voters = await tx.electionVoter.findMany({ where: { electionId: id } });
    if (!voters.length) throw new ElectionError(400, 'Tag the eligible financial members before publishing');
    if (voters.length > 1000) throw new ElectionError(400, 'This election supports up to 1,000 voters');
    const members = await selectedMembers(tx, voters.map(voter => voter.userId), election.opensAt);
    const current = new Map(members.map(member => [member.userId, member]));
    const assignments: Prisma.Sql[] = [];
    const batches: { id: string; electionId: string }[] = [];
    for (let offset = 0; offset < voters.length; offset += 100) {
      const batchId = randomUUID();
      batches.push({ id: batchId, electionId: id });
      for (const voter of voters.slice(offset, offset + 100)) {
        const member = current.get(voter.userId)!;
        // Validate the configured invitation origin before committing publish.
        votingUrl(voter);
        assignments.push(Prisma.sql`(${voter.id}, ${tokenHash(votingToken(voter))}, ${batchId}, ${member.email}, ${member.name}, ${member.voterId})`);
      }
    }
    await tx.electionMailBatch.createMany({ data: batches });
    await tx.$executeRaw(Prisma.sql`
      UPDATE election_voters AS voter SET "tokenHash" = entry.hash,
        "mailBatchId" = entry.batch::uuid, email = entry.email, name = entry.name, "voterId" = entry.label
      FROM (VALUES ${Prisma.join(assignments)}) AS entry(id, hash, batch, email, name, label)
      WHERE voter.id = entry.id AND voter."electionId" = ${id}
    `);
    await tx.election.update({ where: { id }, data: {
      status: 'PUBLISHED', publishedAt: now, financialConfirmedAt: now, revision: { increment: 1 },
    } });
  }, { timeout: 20000 });
}

export async function endElection(id: string, status: 'CLOSED' | 'CANCELLED') {
  await prisma.$transaction(async tx => {
    const election = await lockedElection(tx, id);
    if (election.status !== 'PUBLISHED') throw new ElectionError(409, 'Only a published election can be closed or cancelled');
    await tx.election.update({ where: { id }, data: { status, closedAt: new Date(), revision: { increment: 1 } } });
    // Preserve audit history, but stop invitations that have not been sent yet.
    await tx.electionMailBatch.updateMany({
      where: { electionId: id, status: { in: ['QUEUED', 'FAILED'] } },
      data: { status: 'FAILED', errorCode: 'ELECTION_ENDED' },
    });
  });
}

export async function accessBallot(id: string, token: string) {
  const voter = await prisma.electionVoter.findFirst({
    where: { electionId: id, tokenHash: tokenHash(token), election: { status: { not: 'DRAFT' } } },
    select: { voterId: true, hasVoted: true, election: { select: {
      id: true, title: true, description: true, status: true, opensAt: true, closesAt: true,
      allowAbstain: true, candidates: { orderBy: { order: 'asc' }, select: { id: true, name: true, manifesto: true } },
    } } },
  });
  if (!voter) throw new ElectionError(404, 'Invalid invitation. Open your personal invitation email again.');
  return voter;
}

export async function castBallot(id: string, token: string, candidateId: string | null) {
  await prisma.$transaction(async tx => {
    // Closing/cancelling takes an exclusive lock. Votes share a lock so different
    // members can vote concurrently while closure and submission remain atomic.
    const election = await lockedElection(tx, id, true);
    const now = new Date();
    if (election.status !== 'PUBLISHED' || !election.opensAt || !election.closesAt ||
      election.opensAt > now || election.closesAt <= now) throw new ElectionError(409, 'Voting is not open');
    if (candidateId === null && !election.allowAbstain) throw new ElectionError(400, 'Choose one candidate');
    if (candidateId !== null && !await tx.electionCandidate.findFirst({ where: { id: candidateId, electionId: id }, select: { id: true } })) {
      throw new ElectionError(400, 'Candidate does not belong to this election');
    }
    const voter = await tx.electionVoter.findFirst({
      where: { electionId: id, tokenHash: tokenHash(token) }, select: { id: true },
    });
    if (!voter) throw new ElectionError(404, 'Invalid invitation');
    const claim = await tx.electionVoter.updateMany({ where: { id: voter.id, hasVoted: false }, data: { hasVoted: true } });
    if (claim.count !== 1) throw new ElectionError(409, 'Your vote has already been recorded. You cannot vote again.');
    // No identity, token, timestamp, IP or voter foreign key is stored here.
    // Failure rolls back the participation claim as well as the ballot insert.
    await tx.electionBallot.create({ data: { electionId: id, candidateId }, select: { id: true } });
  }, { timeout: 15000, maxWait: 15000 });
}
