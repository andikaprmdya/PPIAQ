import { NextRequest, NextResponse } from 'next/server';
import { getAllCMSEvents } from '@/lib/database/db';

// GET /api/events - Public endpoint for published events
export async function GET(req: NextRequest) {
  try {
    // Get published events only
    const events = getAllCMSEvents(true); // true = published only

    return NextResponse.json({
      data: events,
      message: `Retrieved ${events.length} published events`,
      meta: { total: events.length },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
