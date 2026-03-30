import { NextRequest, NextResponse } from 'next/server';
import { EventStatus } from '@prisma/client';
import {
  getAllCMSEvents,
  createCMSEvent,
  updateCMSEvent,
  deleteCMSEvent,
} from '@/lib/database/db';
import { checkRoles } from '@/lib/auth/check-roles';

// GET /api/curator/events - List all events with optional filters
export async function GET(req: NextRequest) {
  try {
    const user = await checkRoles(['ADMIN', 'CURATOR']);
    if (!user) {
      return NextResponse.json({ error: 'Access denied. Curator or Admin only.' }, { status: 403 });
    }

    const url = new URL(req.url);
    const statusParam = url.searchParams.get('status');
    const status = statusParam ? (statusParam.toUpperCase() as EventStatus) : null;

    const allEvents = await getAllCMSEvents();
    const filteredEvents = status ? allEvents.filter((e) => e.status === status) : allEvents;

    return NextResponse.json({
      data: filteredEvents,
      message: `Retrieved ${filteredEvents.length} events`,
      meta: { total: filteredEvents.length },
    });
  } catch (error) {
    console.error('Error fetching curator events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/curator/events - Create new event
export async function POST(req: NextRequest) {
  try {
    const user = await checkRoles(['ADMIN', 'CURATOR']);
    if (!user) {
      return NextResponse.json({ error: 'Access denied. Curator or Admin only.' }, { status: 403 });
    }

    const body = await req.json();

    if (!body.day || !body.month || !body.title || !body.date || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields: day, month, title, date, location' },
        { status: 400 }
      );
    }

    const newEvent = await createCMSEvent({
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
    console.error('Error creating curator event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

// PUT /api/curator/events?id=XXX - Update event
export async function PUT(req: NextRequest) {
  try {
    const user = await checkRoles(['ADMIN', 'CURATOR']);
    if (!user) {
      return NextResponse.json({ error: 'Access denied. Curator or Admin only.' }, { status: 403 });
    }

    const url = new URL(req.url);
    const eventId = url.searchParams.get('id');
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const body = await req.json();
    const updatedEvent = await updateCMSEvent(eventId, { ...body });

    if (!updatedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ data: updatedEvent, message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating curator event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE /api/curator/events?id=XXX - Delete event
export async function DELETE(req: NextRequest) {
  try {
    const user = await checkRoles(['ADMIN', 'CURATOR']);
    if (!user) {
      return NextResponse.json({ error: 'Access denied. Curator or Admin only.' }, { status: 403 });
    }

    const url = new URL(req.url);
    const eventId = url.searchParams.get('id');
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const deleted = await deleteCMSEvent(eventId);
    if (!deleted) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting curator event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
