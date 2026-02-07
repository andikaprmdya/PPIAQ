import { NextRequest, NextResponse } from 'next/server';
import { getAllCMSTeamMembers } from '@/lib/database/db';

export async function GET(req: NextRequest) {
  try {
    const members = getAllCMSTeamMembers(true).sort((a, b) => a.order - b.order);
    return NextResponse.json({
      data: members,
      message: `Retrieved ${members.length} active team members`,
      meta: { total: members.length },
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}
