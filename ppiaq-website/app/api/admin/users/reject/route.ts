import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, rejectUser, isAdmin } from '@/lib/database/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get admin user from cookie
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminUser = getUserByEmail(userEmail);

    if (!adminUser || !isAdmin(adminUser.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get userId and reason from request body
    const { userId, reason } = await request.json();

    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'userId and reason are required' },
        { status: 400 }
      );
    }

    // Reject the user
    const user = rejectUser(userId, adminUser.id, reason);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'User rejected successfully',
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/admin/users/reject error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
