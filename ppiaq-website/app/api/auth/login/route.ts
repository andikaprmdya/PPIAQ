import { NextRequest, NextResponse } from 'next/server';
import { UserStatus, Role } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { loginUser } from '@/lib/database/db';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { TEMP_IMPORTED_MEMBER_PASSWORD } from '@/lib/auth/password-reset';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 10 login attempts per IP per minute
    const ip = getClientIp(request);
    const rl = rateLimit(`login:${ip}`, { limit: 10, windowSec: 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${rl.retryAfter}s.` },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

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

    if (
      user.role === Role.USER &&
      bcryptjs.compareSync(TEMP_IMPORTED_MEMBER_PASSWORD, user.password)
    ) {
      return NextResponse.json(
        {
          error: 'Password reset required',
          message:
            'Please use Forgot Password first and complete the email confirmation reset before first login.',
        },
        { status: 403 }
      );
    }

    // Determine redirect URL based on role
    let redirectTo = '/community-board';
    if (user.role === Role.ADMIN) {
      redirectTo = '/admin/dashboard';
    } else if ((user.role as string) === 'CURATOR') {
      redirectTo = '/curator/events';
    }

    // Set cookie for session
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: { ...user, password: undefined },
        redirectTo,
      },
      { status: 200 }
    );

    response.cookies.set('userEmail', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set('userRole', user.role, {
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
