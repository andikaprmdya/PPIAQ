import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, getEventById } from '@/lib/database/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const event = getEventById(id);
      if (!event) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ event }, { status: 200 });
    }

    const events = getAllEvents();
    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
