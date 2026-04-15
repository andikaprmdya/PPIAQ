import { NextRequest, NextResponse } from 'next/server';
import { updateUser, getUserById } from '@/lib/database/db';
import { checkAdmin } from '@/lib/auth/check-admin';
import { validateFirstLastName } from '@/lib/name-validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const adminUser = await checkAdmin();
    if (!adminUser) {
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
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as { password?: string }).password;

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

    const adminUser = await checkAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updates = await request.json();
    console.log('Updating user', userId, 'with data:', updates);

    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const nextFirstName =
      typeof updates?.firstName === 'string' ? updates.firstName : existingUser.firstName;
    const nextLastName =
      typeof updates?.lastName === 'string' ? updates.lastName : existingUser.lastName;
    const nameValidationError = validateFirstLastName(nextFirstName, nextLastName);
    if (nameValidationError) {
      return NextResponse.json({ error: nameValidationError }, { status: 400 });
    }

    // Update the user
    const user = await updateUser(userId, updates);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user without password
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as { password?: string }).password;

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
