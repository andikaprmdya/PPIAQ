import { NextResponse } from 'next/server';
import { getPublicEvents } from '@/lib/database/public-content';
import { PUBLIC_CACHE_HEADERS } from '@/lib/public-cache';

// GET /api/events - Public endpoint for published events
export async function GET() {
  try {
    // Get published events only
    const events = await getPublicEvents();

    return NextResponse.json({
      data: events,
      message: `Retrieved ${events.length} published events`,
      meta: { total: events.length },
    }, { headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
