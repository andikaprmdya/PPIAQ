import { NextRequest, NextResponse } from 'next/server';
import { getCMSEventById, updateCMSEvent, deleteCMSEvent } from '@/lib/database/db';
import { checkAdmin } from '@/lib/auth/check-admin';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'Surrogate-Control': 'no-store',
};

// GET /api/admin/events/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const { id } = await params;
    const event = await getCMSEventById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ data: event }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

// PUT /api/admin/events/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const updated = await updateCMSEvent(id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(
      { data: updated, message: 'Event updated successfully' },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE /api/admin/events/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const { id } = await params;
    const deleted = await deleteCMSEvent(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
