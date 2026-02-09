import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, updateUser, getUserById, isAdmin } from '@/lib/database/db';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

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

    // Get user by ID
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/users/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

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
    console.error('PUT /api/admin/users/[id] error:', error);
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
