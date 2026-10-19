// Runs a production build against a throwaway local PostgreSQL database.
// It explicitly disables real email sending and never loads the production DB.
// Usage: npm run build && npx tsx tests/browser-fixture.ts
import EmbeddedPostgres from 'embedded-postgres';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import bcrypt from 'bcryptjs';

async function main() {
  const directory = await mkdtemp(join(tmpdir(), 'ppiaq-election-browser-'));
  const reservation = createServer();
  await new Promise<void>(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = (reservation.address() as { port: number }).port;
  await new Promise<void>(resolve => reservation.close(() => resolve()));
  const cluster = new EmbeddedPostgres({ databaseDir: join(directory, 'pg'), port, user: 'postgres', password: 'local-browser-fixture', persistent: false, onLog() {}, onError() {} });
  await cluster.initialise(); await cluster.start();
  process.env.DATABASE_URL = `postgresql://postgres:local-browser-fixture@127.0.0.1:${port}/postgres`;
  process.env.AUTH_SECRET = 'isolated-browser-session-key-not-for-production-12345';
  process.env.ELECTION_TOKEN_SECRET = 'isolated-browser-vote-key-not-for-production-123456';
  process.env.ELECTION_SITE_URL = 'http://127.0.0.1:3141';
  process.env.BREVO_API_KEY = '';
  const client = cluster.getPgClient(); await client.connect();
  const root = join(process.cwd(), 'prisma/migrations');
  for (const path of (await readdir(root)).sort()) {
    if (path !== 'migration_lock.toml') await client.query(await readFile(join(root, path, 'migration.sql'), 'utf8'));
  }
  await client.end();
  const { prisma } = await import('../lib/database/prisma');
  const service = await import('../lib/elections/service');
  const rules = await import('../lib/elections/rules');
  const tokens = await import('../lib/elections/tokens');
  const password = 'FixturePassword123!';
  const shared = {
    password: bcrypt.hashSync(password, 10), nationality: 'Indonesia', educationLevel: 'S1', university: 'University of Queensland', major: 'Engineering', birthDate: '2000-01-01',
    membershipType: 'ORDINARY' as const, status: 'APPROVED' as const, paymentProofUrl: '',
    dateJoined: new Date(Date.now() - 86400000 * 20), membershipTermEnds: new Date(Date.now() + 86400000 * 200),
  };
  const admin = await prisma.user.create({ data: { ...shared, firstName: 'Panitia', lastName: 'Demo', email: 'admin@election.example', role: 'ADMIN', memberNo: 'DEMO-ADMIN' } });
  const ordinary = await prisma.user.create({ data: { ...shared, firstName: 'Alya', lastName: 'Demo', email: 'alya@election.example', memberNo: 'DEMO-001' } });
  const associate = await prisma.user.create({ data: { ...shared, firstName: 'Bima', lastName: 'Demo', email: 'bima@election.example', membershipType: 'ASSOCIATE', memberNo: 'DEMO-002' } });
  const draft = await service.createElection(admin.id);
  const election = await service.createElection(admin.id);
  await service.saveElection(election.id, {
    title: 'Pemilihan Presiden PPIAQ — DEMO', description: 'Ini data demonstrasi untuk menguji alur pemilihan. Tidak ada email sungguhan yang dikirim.',
    opensAt: new Date(Date.now() - 60000).toISOString(), closesAt: new Date(Date.now() + 86400000).toISOString(),
    allowAbstain: true, emailSubject: rules.DEFAULT_ELECTION_SUBJECT, emailBody: rules.DEFAULT_ELECTION_BODY,
    candidates: [
      { name: 'Kandidat Demo A', manifesto: 'Meningkatkan dukungan mahasiswa baru dan kegiatan lintas kampus.' },
      { name: 'Kandidat Demo B', manifesto: 'Memperkuat kolaborasi komunitas, pendidikan, dan kesejahteraan anggota.' },
    ], voterUserIds: [ordinary.id, associate.id], revision: 0,
  });
  // Service-level test publish only; the route's outbound email callback is not invoked.
  process.env.BREVO_API_KEY = 'mock-fixture-only';
  await service.publishElection(election.id, 1, true);
  process.env.BREVO_API_KEY = '';
  await prisma.electionMailBatch.updateMany({ data: { status: 'SENT', acceptedAt: new Date() } });
  const voter = await prisma.electionVoter.findFirstOrThrow({ where: { electionId: election.id, userId: ordinary.id } });
  const metadata = {
    origin: 'http://127.0.0.1:3141', adminEmail: admin.email, ordinaryEmail: ordinary.email, password,
    draftId: draft.id, electionId: election.id, votingUrl: tokens.votingUrl(voter), token: tokens.votingToken(voter),
    ordinaryId: ordinary.id, associateId: associate.id,
  };
  const fixturePath = join(tmpdir(), 'ppiaq-election-ui-fixture.json');
  await writeFile(fixturePath, JSON.stringify(metadata), { mode: 0o600 });
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3141'], {
    cwd: process.cwd(), env: { ...process.env, NODE_ENV: 'production', BREVO_API_KEY: '' }, stdio: 'inherit',
  });
  console.log(`Local-only browser fixture: ${metadata.origin}; metadata: ${fixturePath}; real email disabled.`);
  let stopping = false;
  async function cleanup() {
    if (stopping) return; stopping = true;
    server.kill('SIGTERM'); await prisma.$disconnect(); await cluster.stop();
    await rm(directory, { recursive: true, force: true }); await rm(fixturePath, { force: true });
    process.exit(0);
  }
  process.on('SIGINT', cleanup); process.on('SIGTERM', cleanup);
  server.once('exit', cleanup);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
