import { NextRequest, NextResponse } from 'next/server';
import { EventStatus } from '@prisma/client';
import {
  getAllCMSEvents,
  createCMSEvent,
  updateCMSEvent,
  deleteCMSEvent,
} from '@/lib/database/db';
import { checkAdmin } from '@/lib/auth/check-admin';
import {
  EventPayloadError,
  normalizeEventCreatePayload,
  normalizeEventUpdatePayload,
} from '@/lib/events/event-payload';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'Surrogate-Control': 'no-store',
};

// GET /api/admin/events - List all events with optional filters
export async function GET(req: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const statusParam = url.searchParams.get('status');
    const status = statusParam ? (statusParam.toUpperCase() as EventStatus) : null;

    // Fetch events
    const allEvents = await getAllCMSEvents();
    const filteredEvents = status ? allEvents.filter((e) => e.status === status) : allEvents;

    return NextResponse.json({
      data: filteredEvents,
      message: `Retrieved ${filteredEvents.length} events`,
      meta: { total: filteredEvents.length },
    }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/admin/events - Create new event
export async function POST(req: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const body = await req.json();

    const eventPayload = normalizeEventCreatePayload(body, user.id);
    const newEvent = await createCMSEvent(eventPayload);

    return NextResponse.json(
      { data: newEvent, message: 'Event created successfully' },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    if (error instanceof EventPayloadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

// PUT /api/admin/events?id=XXX - Update event
export async function PUT(req: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    // Get event ID from query params
    const url = new URL(req.url);
    const eventId = url.searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const body = await req.json();
    const eventPayload = normalizeEventUpdatePayload(body);
    const updatedEvent = await updateCMSEvent(eventId, eventPayload);

    if (!updatedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(
      { data: updatedEvent, message: 'Event updated successfully' },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    if (error instanceof EventPayloadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE /api/admin/events?id=XXX - Delete event
export async function DELETE(req: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    // Get event ID from query params
    const url = new URL(req.url);
    const eventId = url.searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    // Delete event
    const deleted = await deleteCMSEvent(eventId);

    if (!deleted) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
