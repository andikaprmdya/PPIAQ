import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getAllNewsletterSubscribers, isAdmin } from '@/lib/database/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get admin user from cookie
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = getUserByEmail(userEmail);

    if (!user || !isAdmin(user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all newsletter subscribers
    const subscribers = getAllNewsletterSubscribers();

    return NextResponse.json(subscribers, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/newsletter error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
