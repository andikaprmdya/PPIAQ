import { NextResponse } from 'next/server';
import { getAboutTeamViewMoreEnabled, getAllCMSTeamMembers } from '@/lib/database/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'Surrogate-Control': 'no-store',
};

export async function GET() {
  try {
    const [members, viewMoreEnabled] = await Promise.all([
      getAllCMSTeamMembers(true),
      getAboutTeamViewMoreEnabled(),
    ]);
    const sortedMembers = members.sort((a, b) => a.order - b.order);

    return NextResponse.json({
      data: sortedMembers,
      message: `Retrieved ${sortedMembers.length} active team members`,
      meta: { total: sortedMembers.length, viewMoreEnabled },
    }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}
