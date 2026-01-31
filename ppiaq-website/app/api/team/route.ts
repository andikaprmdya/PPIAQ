import { NextRequest, NextResponse } from 'next/server';
import { getAllTeamMembers, getTeamMemberById } from '@/lib/database/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const member = getTeamMemberById(id);
      if (!member) {
        return NextResponse.json(
          { error: 'Team member not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ member }, { status: 200 });
    }

    const members = getAllTeamMembers();
    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}
