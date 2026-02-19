import { NextRequest, NextResponse } from 'next/server';
import { getAllNewsletterSubscribers } from '@/lib/database/db';
import { checkAdmin } from '@/lib/auth/check-admin';

export async function GET(request: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all newsletter subscribers
    const subscribers = await getAllNewsletterSubscribers();

    return NextResponse.json(subscribers, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/newsletter error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
