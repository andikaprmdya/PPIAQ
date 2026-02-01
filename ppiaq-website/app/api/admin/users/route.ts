import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUsersByStatus, isAdmin } from '@/lib/database/db';
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

    // Get status query parameter
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status parameter' },
        { status: 400 }
      );
    }

    const users = getUsersByStatus(status);

    // Return users without password
    const usersWithoutPassword = users.map(({ password, ...u }) => u);

    return NextResponse.json(usersWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
