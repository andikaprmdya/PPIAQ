import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
});

async function main() {
  console.log('Seeding community board content...');

  // ── DISCOUNTS ──────────────────────────────────────────────────
  const discounts = [
    {
      name: { en: 'Indonesian Restaurant', id: 'Restoran Indonesia' },
      description: { en: '20% discount for members', id: 'Diskon 20% untuk member' },
      code: 'PPIA20',
      validUntil: '2026-12-31',
      isActive: true,
      order: 0,
    },
    {
      name: { en: 'Copy Center', id: 'Tempat Fotokopi' },
      description: { en: '15% off document copying', id: 'Diskon 15% untuk penggandaan dokumen' },
      code: 'PPIA15COPY',
      validUntil: '2026-12-31',
      isActive: true,
      order: 1,
    },
    {
      name: { en: 'Bookstore', id: 'Toko Buku' },
      description: { en: '10% off all books', id: 'Diskon 10% untuk semua buku' },
      code: 'PPIA10BOOKS',
      validUntil: '2026-12-31',
      isActive: true,
      order: 2,
    },
  ];

  for (const d of discounts) {
    await prisma.communityDiscount.upsert({
      where: { id: d.code },
      update: d,
      create: { id: d.code, ...d },
    });
  }
  console.log(`✅ Seeded ${discounts.length} discounts`);

  // ── RESOURCES ──────────────────────────────────────────────────
  const resources = [
    { category: { en: 'Restaurants & Cafes', id: 'Restoran & Kafe' }, name: { en: 'Warung Makan Jaya', id: 'Warung Makan Jaya' }, location: 'South Bank', order: 0 },
    { category: { en: 'Restaurants & Cafes', id: 'Restoran & Kafe' }, name: { en: 'Indonesian Cafe', id: 'Kafe Indonesia' }, location: 'City', order: 1 },
    { category: { en: 'Restaurants & Cafes', id: 'Restoran & Kafe' }, name: { en: 'Nasi Kuning', id: 'Nasi Kuning' }, location: 'Fortitude Valley', order: 2 },
    { category: { en: 'Accommodation & Housing', id: 'Akomodasi & Perumahan' }, name: { en: 'Student Dorm', id: 'Asrama Mahasiswa' }, location: 'West End', order: 0 },
    { category: { en: 'Accommodation & Housing', id: 'Akomodasi & Perumahan' }, name: { en: 'Shared Apartment', id: 'Apartemen Bersama' }, location: 'Milton', order: 1 },
    { category: { en: 'Accommodation & Housing', id: 'Akomodasi & Perumahan' }, name: { en: 'Rental House', id: 'Rumah Sewa' }, location: 'Southbank', order: 2 },
    { category: { en: 'Learning Resources', id: 'Sumber Belajar' }, name: { en: 'University Library', id: 'Perpustakaan Universitas' }, location: 'Each Campus', order: 0 },
    { category: { en: 'Learning Resources', id: 'Sumber Belajar' }, name: { en: 'Language Center', id: 'Pusat Bahasa' }, location: 'City', order: 1 },
    { category: { en: 'Learning Resources', id: 'Sumber Belajar' }, name: { en: 'Study Group Studio', id: 'Studio Belajar Bersama' }, location: 'Online', order: 2 },
  ];

  await prisma.communityResource.deleteMany();
  await prisma.communityResource.createMany({ data: resources.map(r => ({ ...r, isActive: true })) });
  console.log(`✅ Seeded ${resources.length} resources`);

  // ── ANNOUNCEMENTS ──────────────────────────────────────────────
  const announcements = [
    {
      title: { en: 'Pesta Rakyat 2026', id: 'Pesta Rakyat 2026' },
      description: { en: 'Join the biggest Indonesian Independence Day celebration in Queensland!', id: 'Bergabunglah dengan perayaan Indonesian Independence Day terbesar di Queensland!' },
      date: '2026-08-17',
      isActive: true,
      order: 0,
    },
    {
      title: { en: 'Skills Workshop', id: 'Workshop Keterampilan' },
      description: { en: 'Free workshop for members on career development and networking', id: 'Workshop gratis untuk anggota tentang pengembangan karir dan networking' },
      date: '2026-03-15',
      isActive: true,
      order: 1,
    },
    {
      title: { en: 'Monthly Gathering', id: 'Gathering Bulanan' },
      description: { en: 'Regular monthly event to strengthen bonds among members', id: 'Acara rutin bulanan untuk mempererat hubungan antar anggota' },
      date: '2026-02-28',
      isActive: true,
      order: 2,
    },
  ];

  await prisma.communityAnnouncement.deleteMany();
  await prisma.communityAnnouncement.createMany({ data: announcements });
  console.log(`✅ Seeded ${announcements.length} announcements`);

  console.log('🎉 Community board seeding complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
