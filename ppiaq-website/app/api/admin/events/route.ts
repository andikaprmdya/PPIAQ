import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getAllCMSEvents,
  getCMSEventById,
  createCMSEvent,
  updateCMSEvent,
  deleteCMSEvent,
  publishCMSEvent,
  unpublishCMSEvent,
  getUserByEmail,
  isAdmin,
} from '@/lib/database/db';

// GET /api/admin/events - List all events with optional filters
export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = getUserByEmail(userEmail);
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status') as 'draft' | 'published' | null;

    // Fetch events
    const allEvents = getAllCMSEvents();
    const filteredEvents = status ? allEvents.filter((e) => e.status === status) : allEvents;

    return NextResponse.json({
      data: filteredEvents,
      message: `Retrieved ${filteredEvents.length} events`,
      meta: { total: filteredEvents.length },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/admin/events - Create new event
export async function POST(req: NextRequest) {
  try {
    // Authentication check
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

    // Validation
    if (!body.day || !body.month || !body.title || !body.date || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields: day, month, title, date, location' },
        { status: 400 }
      );
    }

    // Create event
    const newEvent = createCMSEvent({
      day: body.day,
      month: body.month,
      title: body.title,
      date: body.date,
      location: body.location,
      description: body.description || { id: '', en: '' },
      image: body.image || '',
      registrationUrl: body.registrationUrl,
      status: body.status || 'draft',
      createdBy: user.id,
    });

    return NextResponse.json({ data: newEvent, message: 'Event created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

// PUT /api/admin/events?id=XXX - Update event
export async function PUT(req: NextRequest) {
  try {
    // Authentication check
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = getUserByEmail(userEmail);
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    // Get event ID from query params
    const url = new URL(req.url);
    const eventId = url.searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const body = await req.json();

    // Update event
    const updatedEvent = updateCMSEvent(eventId, {
      ...body,
    });

    if (!updatedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ data: updatedEvent, message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE /api/admin/events?id=XXX - Delete event
export async function DELETE(req: NextRequest) {
  try {
    // Authentication check
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = getUserByEmail(userEmail);
    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    // Get event ID from query params
    const url = new URL(req.url);
    const eventId = url.searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    // Delete event
    const deleted = deleteCMSEvent(eventId);

    if (!deleted) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
