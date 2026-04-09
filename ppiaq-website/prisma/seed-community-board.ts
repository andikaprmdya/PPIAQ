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

  // ── PARTNER OBLIGATIONS / BENEFITS ────────────────────────────
  const discounts = [
    {
      id: 'partner-racc',
      name: { en: 'RACC', id: 'RACC' },
      description: {
        en: '- Financial support of AUD 1,500 over 3 years (paid - lumpsum)\n- Discounted service fee for TR - 485 visa\n- In-person event attendees: $200 RACC vouchers, win lucky draw prizes\n- O-Week participants will also be given goody bags supplied by RACC.',
        id: '- Financial support of AUD 1,500 over 3 years (paid - lumpsum)\n- Discounted service fee for TR - 485 visa\n- In-person event attendees: $200 RACC vouchers, win lucky draw prizes\n- O-Week participants will also be given goody bags supplied by RACC.',
      },
      code: '- Instagram static posts: Once every two months. [Google Drive Link Provided]\n- Instagram story posts: 2x Monthly\n- Liking RACC posts.',
      validUntil: 'May 1, 2028',
      isActive: true,
      order: 0,
    },
    {
      id: 'partner-happy-shop',
      name: { en: 'Happy Shop', id: 'Happy Shop' },
      description: {
        en: '- Provide 5% discount for PPIA cardholders\n- Acknowledge PPIA Queensland as one of Happy Shop Indonesian Groceries proud partners (Posters to be put up)',
        id: '- Provide 5% discount for PPIA cardholders\n- Acknowledge PPIA Queensland as one of Happy Shop Indonesian Groceries proud partners (Posters to be put up)',
      },
      code: '- 1 Instagram story and 1 post per month\n- 5% Discount when opening a stall at Pesta Rakyat\n- Adlibs on PPIAQ\'s events (opening and closing)\n- Medium logo size on event publication materials (e.g. "Sponsored by:")',
      validUntil: 'July 28, 2027',
      isActive: true,
      order: 1,
    },
    {
      id: 'partner-shalom-st-lucia',
      name: { en: 'Shalom St Lucia', id: 'Shalom St Lucia' },
      description: {
        en: '- Provide 5% discount for PPIA cardholders - cash terms only\n- Acknowledge PPIA Queensland as one of Happy Shop Indonesian Groceries proud partners (Posters to be put up)',
        id: '- Provide 5% discount for PPIA cardholders - cash terms only\n- Acknowledge PPIA Queensland as one of Happy Shop Indonesian Groceries proud partners (Posters to be put up)',
      },
      code: '- 1 Instagram story and 1 post per month\n- 5% Discount when opening a stall at Pesta Rakyat\n- Adlibs on PPIAQ\'s events (opening and closing)\n- Medium logo size on event publication materials (e.g. "Sponsored by:")',
      validUntil: 'March 18, 2027',
      isActive: true,
      order: 2,
    },
    {
      id: 'partner-sendok-garpu-tbd',
      name: { en: 'Sendok Garpu [TBD]', id: 'Sendok Garpu [TBD]' },
      description: {
        en: '- Provide 10% discount for PPIA cardholders\n- Acknowledge PPIA Queensland as one of Happy Shop Indonesian Groceries proud partners (Posters to be put up)',
        id: '- Provide 10% discount for PPIA cardholders\n- Acknowledge PPIA Queensland as one of Happy Shop Indonesian Groceries proud partners (Posters to be put up)',
      },
      code: '- 1 Instagram story and 1 post per month\n- Re-sharing of SG\'s Instagram post on PPIAQ\'s IG story\n- 10% Discount when opening a stall at Pesta Rakyat\n- Adlibs on PPIAQ\'s events (opening and closing)\n- Large logo size on event publication materials (e.g. "Sponsored by:")',
      validUntil: 'March 4, 2027',
      isActive: true,
      order: 3,
    },
    {
      id: 'partner-tuyas-taste',
      name: { en: "Tuya's Taste", id: "Tuya's Taste" },
      description: {
        en: '- Provide 10% discount on agreed items for PPIA cardholders (direct buying from Tuya Taste store, including online store), Tuya Taste weekly market, and any Tuya Taste stall at special events such as Pesta Rakyat).\n- Acknowledge PPIA Queensland as one of Tuya Taste proud partners',
        id: '- Provide 10% discount on agreed items for PPIA cardholders (direct buying from Tuya Taste store, including online store), Tuya Taste weekly market, and any Tuya Taste stall at special events such as Pesta Rakyat).\n- Acknowledge PPIA Queensland as one of Tuya Taste proud partners',
      },
      code: '- 2 Instagram story and 1 post per month\n- 10% Discount when opening a stall at Pesta Rakyat\n- Adlibs on PPIAQ\'s events (opening and closing)\n- Large logo size on event publication materials (e.g. "Sponsored by:")',
      validUntil: 'May 14, 2027',
      isActive: true,
      order: 4,
    },
    {
      id: 'partner-uumu-tea',
      name: { en: 'Uumu Tea', id: 'Uumu Tea' },
      description: {
        en: '- Buy 1 Large drink get 1 free (limited to 1 person per pop up)\n- 10% off catering orders',
        id: '- Buy 1 Large drink get 1 free (limited to 1 person per pop up)\n- 10% off catering orders',
      },
      code: '- Guarantee a 10% discount for tenant fee at Pesta Rakyat 2026 (either pre or main event)\n- 2 Instagram posts on PPIAQ feed per MoU period\n- 2 Instagram reels / TikTok video per MoU period',
      validUntil: 'December 31, 2026',
      isActive: true,
      order: 5,
    },
  ];

  await prisma.communityDiscount.deleteMany();
  await prisma.communityDiscount.createMany({ data: discounts });
  console.log(`✅ Seeded ${discounts.length} partner entries`);

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
