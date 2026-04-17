import { NextResponse } from 'next/server';
import { getAllCMSEvents } from '@/lib/database/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'Surrogate-Control': 'no-store',
};

// GET /api/events - Public endpoint for published events
export async function GET() {
  try {
    // Get published events only
    const events = await getAllCMSEvents(true); // true = published only

    return NextResponse.json({
      data: events,
      message: `Retrieved ${events.length} published events`,
      meta: { total: events.length },
    }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
