import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
});

const partnerRows = [
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

async function main() {
  const partnerIds = partnerRows.map((row) => row.id);

  await prisma.communityDiscount.deleteMany({
    where: { id: { notIn: partnerIds } },
  });

  for (const row of partnerRows) {
    await prisma.communityDiscount.upsert({
      where: { id: row.id },
      update: row,
      create: row,
    });
  }

  console.log(`Synced ${partnerRows.length} partner obligation entries.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
