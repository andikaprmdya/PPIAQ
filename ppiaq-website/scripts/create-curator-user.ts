import 'dotenv/config';
import bcryptjs from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, MembershipType, Role, UserStatus } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Please configure your database connection first.');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.CURATOR_EMAIL || 'curator@ppiaq.org';
  const password = process.env.CURATOR_PASSWORD || 'Curator123!';
  const hashedPassword = bcryptjs.hashSync(password, 10);

  const curator = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: Role.CURATOR,
      status: UserStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: 'system',
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null,
    },
    create: {
      firstName: 'Curator',
      lastName: 'Events',
      email,
      password: hashedPassword,
      nationality: 'Indonesia',
      educationLevel: 'S1 (Bachelor)',
      university: 'Queensland University of Technology',
      major: 'Communication',
      birthDate: '1998-07-20',
      membershipType: MembershipType.ORDINARY,
      paymentProofUrl: '',
      role: Role.CURATOR,
      status: UserStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: 'system',
    },
  });

  console.log('Curator account is ready:');
  console.log(`Email: ${curator.email}`);
  console.log(`Role: ${curator.role}`);
  console.log(`Status: ${curator.status}`);
}

main()
  .catch((error) => {
    console.error('Failed to create/update curator account:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
