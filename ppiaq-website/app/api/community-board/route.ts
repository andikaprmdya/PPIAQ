import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET() {
  try {
    const [discounts, resources, announcements] = await Promise.all([
      prisma.communityDiscount.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      prisma.communityResource.findMany({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { order: 'asc' }],
      }),
      prisma.communityAnnouncement.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
    ]);

    return NextResponse.json({ discounts, resources, announcements });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
