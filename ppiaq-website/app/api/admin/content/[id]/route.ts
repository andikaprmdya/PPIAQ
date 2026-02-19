import { NextRequest, NextResponse } from 'next/server';
import { updateStaticContent, deleteStaticContent } from '@/lib/database/db';
import { checkAdmin } from '@/lib/auth/check-admin';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAdmin();
    if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const updated = await updateStaticContent(id, body);

    if (!updated) return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    return NextResponse.json({ data: updated, message: 'Content updated successfully' });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAdmin();
    if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const { id } = await params;
    const deleted = await deleteStaticContent(id);
    if (!deleted) return NextResponse.json({ error: 'Content not found' }, { status: 404 });

    return NextResponse.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}
