// Idempotent draft setup. This script does not enroll voters or send emails.
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

async function main() {
  const { prisma } = await import('../lib/database/prisma');
  const { createElection } = await import('../lib/elections/service');
  try {
    const email = process.argv[2]?.trim().toLowerCase();
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN', status: 'APPROVED', ...(email ? { email } : {}) }, select: { id: true },
    });
    if (!admin) throw new Error('An approved ADMIN account is required to own the draft');
    const existing = await prisma.election.findFirst({
      where: { status: 'DRAFT', title: 'Pemilihan Presiden PPIAQ', createdBy: admin.id }, select: { id: true },
    });
    const election = existing || await createElection(admin.id);
    console.log(`Draft ready: /admin/elections/${election.id}. No voters enrolled; no emails sent.`);
  } finally { await prisma.$disconnect(); }
}

main().catch(error => { console.error(error instanceof Error ? error.message : 'Draft setup failed'); process.exitCode = 1; });
