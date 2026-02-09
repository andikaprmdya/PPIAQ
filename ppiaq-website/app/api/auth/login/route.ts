import { NextRequest, NextResponse } from 'next/server';
import { UserStatus } from '@prisma/client';
import { loginUser } from '@/lib/database/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Login user (verifies password with bcrypt)
    const user = await loginUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check user status
    if (user.status === UserStatus.PENDING) {
      return NextResponse.json(
        {
          error: 'Application pending approval',
          message: 'Your application is pending admin approval. Please wait for approval before logging in.',
          user: undefined,
        },
        { status: 403 }
      );
    }

    if (user.status === UserStatus.REJECTED) {
      return NextResponse.json(
        {
          error: 'Application rejected',
          message: `Your application was rejected: ${user.rejectionReason || 'No reason provided'}`,
          user: undefined,
        },
        { status: 403 }
      );
    }

    // Set cookie for session
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: { ...user, password: undefined },
      },
      { status: 200 }
    );

    response.cookies.set('userEmail', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
