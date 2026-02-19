import { NextRequest, NextResponse } from 'next/server';
import { getCMSTeamMemberById, updateCMSTeamMember, deleteCMSTeamMember } from '@/lib/database/db';
import { checkAdmin } from '@/lib/auth/check-admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAdmin();
    if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const { id } = await params;
    const member = await getCMSTeamMemberById(id);
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    return NextResponse.json({ data: member });
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAdmin();
    if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const updated = await updateCMSTeamMember(id, body);

    if (!updated) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    return NextResponse.json({ data: updated, message: 'Member updated successfully' });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAdmin();
    if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const { id } = await params;
    const deleted = await deleteCMSTeamMember(id);
    if (!deleted) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    return NextResponse.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
