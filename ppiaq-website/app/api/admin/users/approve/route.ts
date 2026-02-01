import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUsersByStatus, approveUser, isAdmin } from '@/lib/database/db';
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

    // Get userId from request body
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Approve the user
    const user = approveUser(userId, adminUser.id);

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
        message: 'User approved successfully',
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/admin/users/approve error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
