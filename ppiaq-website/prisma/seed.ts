import 'dotenv/config';
import { PrismaClient, Role, MembershipType, EventStatus, Division } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcryptjs from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Delete existing data (for clean slate)
  await prisma.imageAsset.deleteMany();
  await prisma.event.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.staticContent.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'ppiaqldmaster@gmail.com',
      password: bcryptjs.hashSync('Admin123!', 10),
      nationality: 'Indonesia',
      educationLevel: 'S2',
      university: 'University of Queensland',
      major: 'Engineering',
      birthDate: '1990-01-01',
      membershipType: MembershipType.ORDINARY,
      paymentProofUrl: '',
      role: Role.ADMIN,
      status: 'APPROVED',
      createdAt: new Date('2024-01-01'),
      approvedAt: new Date('2024-01-01'),
      approvedBy: 'system',
    },
  });

  console.log(`Created admin user: ${admin.email}`);

  // Create curator user (upcoming events manager)
  const curator = await prisma.user.create({
    data: {
      firstName: 'Curator',
      lastName: 'Events',
      email: 'qld@ppi-australia.org',
      password: bcryptjs.hashSync('Curator123!', 10),
      nationality: 'Indonesia',
      educationLevel: 'S1 (Bachelor)',
      university: 'Queensland University of Technology',
      major: 'Communication',
      birthDate: '1998-07-20',
      membershipType: MembershipType.ORDINARY,
      paymentProofUrl: '',
      role: Role.CURATOR,
      status: 'APPROVED',
      createdAt: new Date('2024-01-10'),
      approvedAt: new Date('2024-01-10'),
      approvedBy: admin.id,
    },
  });

  console.log(`Created curator user: ${curator.email}`);

  // Create test user
  const testUser = await prisma.user.create({
    data: {
      firstName: 'Budi',
      lastName: 'Santoso',
      email: 'budi@example.com',
      password: bcryptjs.hashSync('Test12345', 10),
      nationality: 'Indonesia',
      educationLevel: 'S1 (Bachelor)',
      university: 'University of Queensland',
      major: 'Computer Science',
      birthDate: '2000-05-15',
      membershipType: MembershipType.ORDINARY,
      paymentProofUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      role: 'USER',
      status: 'APPROVED',
      createdAt: new Date('2024-01-15'),
      approvedAt: new Date('2024-01-16'),
      approvedBy: admin.id,
    },
  });

  console.log(`Created test user: ${testUser.email}`);

  // Seed events
  const events = [
    {
      day: '5',
      month: 'FEB',
      title: { id: 'Pre-Departure Briefing - Semester 1, 2026', en: 'Pre-Departure Briefing - Semester 1, 2026' },
      date: 'Thursday, February 5, 2026',
      organizer: 'PPIAQ',
      location: { id: 'Zoom', en: 'Zoom' },
      description: { id: 'Persiapan keberangkatan untuk semester 1, 2026', en: 'Preparation briefing for semester 1, 2026' },
      image: '/images/predeparture.jpg',
      status: EventStatus.PUBLISHED,
      createdBy: admin.id,
    },
    {
      day: '16',
      month: 'FEB',
      title: { id: 'QUT Market Day - Join ISAQ / PPIA QUT', en: 'QUT Market Day - Join ISAQ / PPIA QUT' },
      date: 'Monday, February 16, 2026',
      organizer: 'QUT',
      location: { id: 'QUT', en: 'QUT' },
      description: { id: 'Bergabunglah dengan ISAQ di Market Day QUT', en: 'Join ISAQ at QUT Market Day' },
      image: '/images/qutmarketday.jpg',
      status: EventStatus.PUBLISHED,
      createdBy: admin.id,
    },
    {
      day: '18',
      month: 'FEB',
      title: { id: 'UQ St. Lucia Market Day - Join UQISA / PPIA UQ', en: 'UQ St. Lucia Market Day - Join UQISA / PPIA UQ' },
      date: 'Wednesday, February 18, 2026',
      organizer: 'UQISA',
      location: { id: 'UQ St. Lucia', en: 'UQ St. Lucia' },
      description: { id: 'Bergabunglah dengan UQISA di Market Day', en: 'Join UQISA at Market Day' },
      image: '/images/uqmarketday.jpg',
      status: EventStatus.PUBLISHED,
      createdBy: admin.id,
    },
  ];

  for (const event of events) {
    await prisma.event.create({
      data: {
        ...event,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    });
  }

  console.log(`Created ${events.length} events`);

  // Seed team members
  const teamMembers = [
    {
      name: 'Rafika Kusuma',
      role: { id: 'Ketua', en: 'President' },
      university: 'University of Queensland',
      instagram: '@rafikakusuma',
      image: '/images/rafika.png',
      bio: { id: 'Pemimpin Kabinet PAGI 2026 dengan fokus pada visi dan misi organisasi.', en: 'Leader of Kabinet PAGI 2026 with focus on the organization\'s vision and mission.' },
      division: Division.CORE,
      order: 1,
    },
    {
      name: 'Andika Pramudya Wardana',
      role: { id: 'Wakil Ketua Internal', en: 'Vice President Internal' },
      university: 'University of Queensland',
      instagram: '@andikawdna',
      image: '/images/Andika.png',
      bio: { id: 'Mengelola operasional internal dan koordinasi dengan divisi-divisi.', en: 'Managing internal operations and coordination with divisions.' },
      division: Division.CORE,
      order: 2,
    },
    {
      name: 'Vincent Hamdali',
      role: { id: 'Wakil Ketua Eksternal', en: 'Vice President External' },
      university: 'University of Queensland',
      instagram: '@vincenthamdali',
      image: '/images/vincent.jpg',
      bio: { id: 'Membangun hubungan eksternal dan kemitraan strategis dengan organisasi lain.', en: 'Building external relations and strategic partnerships with other organizations.' },
      division: Division.CORE,
      order: 3,
    },
    {
      name: 'Emmanuela Stefany Sugiarto',
      role: { id: 'Sekretaris Jenderal', en: 'Secretary General' },
      university: 'University of Queensland',
      instagram: '@emmanuelas',
      image: '/images/emma.png',
      bio: { id: 'Mengelola dokumentasi dan administrasi keseluruhan organisasi.', en: 'Managing documentation and overall organizational administration.' },
      division: Division.CORE,
      order: 4,
    },
    {
      name: 'Fanny Alfianti',
      role: { id: 'Bendahara Jenderal', en: 'Treasurer General' },
      university: 'University of Queensland',
      instagram: '@fannyalfianti',
      image: '/images/Fani.png',
      bio: { id: 'Mengelola keuangan dan anggaran organisasi untuk semua program.', en: 'Managing organization finances and budget for all programs.' },
      division: Division.CORE,
      order: 5,
    },
    {
      name: 'John Doe',
      role: { id: 'Direktur Administrasi & Logistik', en: 'Administration & Logistics Director' },
      university: 'University of Queensland',
      instagram: '@johndoe',
      image: '/images/placeholder.jpg',
      bio: { id: 'Memimpin divisi administrasi dan logistik', en: 'Leading the administration and logistics division' },
      division: Division.ADMIN,
      order: 1,
    },
    {
      name: 'Jane Smith',
      role: { id: 'Petugas Administrasi & Logistik', en: 'Administration & Logistics Officer' },
      university: 'University of Queensland',
      instagram: '@janesmith',
      image: '/images/placeholder.jpg',
      bio: { id: 'Mengelola administrasi organisasi', en: 'Managing organizational administration' },
      division: Division.ADMIN,
      order: 2,
    },
    {
      name: 'Michael Johnson',
      role: { id: 'Petugas Administrasi & Logistik', en: 'Administration & Logistics Officer' },
      university: 'University of Queensland',
      instagram: '@mjohnson',
      image: '/images/placeholder.jpg',
      bio: { id: 'Koordinator logistik untuk acara', en: 'Event logistics coordinator' },
      division: Division.ADMIN,
      order: 3,
    },
    {
      name: 'Sarah Williams',
      role: { id: 'Direktur Pendidikan & Pengembangan', en: 'Education & Development Director' },
      university: 'University of Queensland',
      instagram: '@sarahwilliams',
      image: '/images/placeholder.jpg',
      bio: { id: 'Mengarahkan program pendidikan dan pengembangan', en: 'Directing education and development programs' },
      division: Division.EDUCATION,
      order: 1,
    },
    {
      name: 'David Brown',
      role: { id: 'Petugas Pendidikan & Pengembangan', en: 'Education & Development Officer' },
      university: 'University of Queensland',
      instagram: '@davidbrown',
      image: '/images/placeholder.jpg',
      bio: { id: 'Mengelola workshop dan seminar', en: 'Managing workshops and seminars' },
      division: Division.EDUCATION,
      order: 2,
    },
    {
      name: 'Emma Davis',
      role: { id: 'Petugas Pendidikan & Pengembangan', en: 'Education & Development Officer' },
      university: 'University of Queensland',
      instagram: '@emmadavis',
      image: '/images/placeholder.jpg',
      bio: { id: 'Program pengembangan kepemimpinan', en: 'Leadership development programs' },
      division: Division.EDUCATION,
      order: 3,
    },
    {
      name: 'Lucas Martinez',
      role: { id: 'Direktur Olahraga, Seni & Budaya', en: 'Sports, Arts & Culture Director' },
      university: 'University of Queensland',
      instagram: '@lucasmartinez',
      image: '/images/placeholder.jpg',
      bio: { id: 'Memimpin acara olahraga dan budaya', en: 'Leading sports and cultural events' },
      division: Division.SPORTS,
      order: 1,
    },
    {
      name: 'Sophia Garcia',
      role: { id: 'Petugas Olahraga, Seni & Budaya', en: 'Sports, Arts & Culture Officer' },
      university: 'University of Queensland',
      instagram: '@sophiagarcia',
      image: '/images/placeholder.jpg',
      bio: { id: 'Mengorganisir turnamen olahraga', en: 'Organizing sports tournaments' },
      division: Division.SPORTS,
      order: 2,
    },
    {
      name: 'Oliver Taylor',
      role: { id: 'Petugas Olahraga, Seni & Budaya', en: 'Sports, Arts & Culture Officer' },
      university: 'University of Queensland',
      instagram: '@olivertaylor',
      image: '/images/placeholder.jpg',
      bio: { id: 'Program seni dan budaya', en: 'Arts and culture programs' },
      division: Division.SPORTS,
      order: 3,
    },
    {
      name: 'Isabella Anderson',
      role: { id: 'Direktur Media & Komunikasi', en: 'Media & Communications Director' },
      university: 'University of Queensland',
      instagram: '@isabellaanderson',
      image: '/images/placeholder.jpg',
      bio: { id: 'Mengelola komunikasi dan media sosial', en: 'Managing communications and social media' },
      division: Division.MEDIA,
      order: 1,
    },
    {
      name: 'James Wilson',
      role: { id: 'Petugas Media & Komunikasi', en: 'Media & Communications Officer' },
      university: 'University of Queensland',
      instagram: '@jameswilson',
      image: '/images/placeholder.jpg',
      bio: { id: 'Content creator dan photographer', en: 'Content creator and photographer' },
      division: Division.MEDIA,
      order: 2,
    },
    {
      name: 'Charlotte Moore',
      role: { id: 'Petugas Media & Komunikasi', en: 'Media & Communications Officer' },
      university: 'University of Queensland',
      instagram: '@charlottemoore',
      image: '/images/placeholder.jpg',
      bio: { id: 'Desain grafis dan branding', en: 'Graphic design and branding' },
      division: Division.MEDIA,
      order: 3,
    },
    {
      name: 'Benjamin Lee',
      role: { id: 'Petugas Kemitraan', en: 'Partnership Officer' },
      university: 'University of Queensland',
      instagram: '@benjaminlee',
      image: '/images/placeholder.jpg',
      bio: { id: 'Membangun hubungan kemitraan strategis', en: 'Building strategic partnerships' },
      division: Division.PARTNERSHIP,
      order: 1,
    },
  ];

  for (const member of teamMembers) {
    await prisma.teamMember.create({
      data: {
        ...member,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    });
  }

  console.log(`Created ${teamMembers.length} team members`);

  // Seed FAQs
  const faqs = [
    {
      question: { id: 'Apa saja manfaat menjadi anggota?', en: 'What are the benefits of becoming a member?' },
      answer: { id: 'Anggota PPIAQ mendapatkan akses eksklusif ke acara khusus, diskon dari mitra, akses awal ke kalender program, dan akses penuh ke papan komunitas.', en: 'PPIAQ members receive exclusive pricing to special events, early access to our program calendar, full access to our community board, and special partner discounts.' },
      page: 'home',
      order: 1,
    },
    {
      question: { id: 'Bisakah saya menjadi anggota?', en: 'Can I become a member?' },
      answer: { id: 'Ya! Jika Anda mahasiswa Indonesia di Queensland atau tertarik mendukung komunitas, Anda bisa mendaftar sebagai Ordinary Member atau Associate Member.', en: 'Yes! If you\'re an Indonesian student in Queensland or interested in supporting our community, you can register as an Ordinary Member or Associate Member.' },
      page: 'home',
      order: 2,
    },
    {
      question: { id: 'Mengapa saya harus menyelesaikan formulir database?', en: 'Why should I complete the database form?' },
      answer: { id: 'Formulir database membantu kami tetap terhubung dengan semua pelajar Indonesia dan memberikan informasi penting tentang peluang, acara, dan dukungan komunitas.', en: 'The database form helps us stay connected with all Indonesian students and allows us to share important information about opportunities, events, and community support.' },
      page: 'home',
      order: 3,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: {
        ...faq,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    });
  }

  console.log(`Created ${faqs.length} FAQs`);

  // Seed newsletter subscriber
  await prisma.newsletterSubscriber.create({
    data: {
      email: 'subscriber@example.com',
      subscribedAt: new Date('2024-01-10'),
    },
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
