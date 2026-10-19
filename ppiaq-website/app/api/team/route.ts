import { NextResponse } from 'next/server';
import { getPublicTeam } from '@/lib/database/public-content';
import { PUBLIC_CACHE_HEADERS } from '@/lib/public-cache';

export async function GET() {
  try {
    const { members: sortedMembers, viewMoreEnabled } = await getPublicTeam();

    return NextResponse.json({
      data: sortedMembers,
      message: `Retrieved ${sortedMembers.length} active team members`,
      meta: { total: sortedMembers.length, viewMoreEnabled },
    }, { headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}
