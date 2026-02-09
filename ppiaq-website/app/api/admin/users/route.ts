import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getUsersByStatus, isAdmin, updateUser, getUserById } from '@/lib/database/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get admin user from cookie
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserByEmail(userEmail);

    if (!user || !(await isAdmin(user.id))) {
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

    const users = await getUsersByStatus(status);

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

export async function PUT(request: NextRequest) {
  try {
    // Get admin user from cookie
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminUser = await getUserByEmail(userEmail);

    if (!adminUser || !(await isAdmin(adminUser.id))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get userId from query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId (id query parameter) is required' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    console.log('Updating user', userId, 'with data:', updates);

    // Update the user
    const user = await updateUser(userId, updates);

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
        message: 'User updated successfully',
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/admin/users error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
