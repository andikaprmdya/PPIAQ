import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getAllCMSTeamMembers,
  createCMSTeamMember,
  reorderCMSTeamMembers,
  getUserByEmail,
  isAdmin,
} from '@/lib/database/db';

// GET /api/admin/team - List all team members
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = getUserByEmail(userEmail);
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const division = new URL(req.url).searchParams.get('division');
    const members = getAllCMSTeamMembers();
    const filtered = division ? members.filter((m) => m.division === division) : members;

    return NextResponse.json({
      data: filtered.sort((a, b) => a.order - b.order),
      message: `Retrieved ${filtered.length} team members`,
      meta: { total: filtered.length },
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

// POST /api/admin/team - Create new team member
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = getUserByEmail(userEmail);
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const body = await req.json();

    if (!body.name || !body.role || !body.division) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role, division' },
        { status: 400 }
      );
    }

    const newMember = createCMSTeamMember({
      name: body.name,
      role: body.role,
      university: body.university || '',
      instagram: body.instagram || '',
      image: body.image || '',
      bio: body.bio || { id: '', en: '' },
      division: body.division,
      order: body.order || 999,
      isActive: body.isActive !== false,
    });

    return NextResponse.json({ data: newMember, message: 'Team member created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}

// PUT /api/admin/team/reorder - Reorder team members
export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = getUserByEmail(userEmail);
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    
    if (!Array.isArray(body.ids)) {
      return NextResponse.json({ error: 'ids must be an array' }, { status: 400 });
    }

    const success = reorderCMSTeamMembers(body.ids);

    if (!success) {
      return NextResponse.json({ error: 'Failed to reorder members' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Team members reordered successfully' });
  } catch (error) {
    console.error('Error reordering team members:', error);
    return NextResponse.json({ error: 'Failed to reorder members' }, { status: 500 });
  }
}
