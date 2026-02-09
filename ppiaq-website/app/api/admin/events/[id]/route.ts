import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCMSEventById, updateCMSEvent, deleteCMSEvent, getUserByEmail, isAdmin } from '@/lib/database/db';

// GET /api/admin/events/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authentication check
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserByEmail(userEmail);
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const { id } = await params;
    const event = await getCMSEventById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ data: event });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

// PUT /api/admin/events/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authentication check
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserByEmail(userEmail);
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const updated = await updateCMSEvent(id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ data: updated, message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE /api/admin/events/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authentication check
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserByEmail(userEmail);
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const { id } = await params;
    const deleted = await deleteCMSEvent(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
