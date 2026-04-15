import bcryptjs from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  getPasswordFingerprint,
  TEMP_IMPORTED_MEMBER_PASSWORD,
  verifyPasswordResetToken,
} from '@/lib/auth/password-reset';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`reset-password:${ip}`, { limit: 10, windowSec: 300 });
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many reset attempts. Try again in ${rl.retryAfter}s.` },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const { token, password } = await request.json();
    const normalizedPassword = String(password || '').trim();

    if (!token || !normalizedPassword) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (normalizedPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (normalizedPassword === TEMP_IMPORTED_MEMBER_PASSWORD) {
      return NextResponse.json(
        { error: 'Please choose a different password from the temporary password' },
        { status: 400 }
      );
    }

    const verification = verifyPasswordResetToken(String(token));
    if (!verification.valid) {
      return NextResponse.json({ error: verification.error }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: verification.payload.userId },
      select: { id: true, email: true, password: true },
    });

    if (!user || user.email.toLowerCase() !== verification.payload.email.toLowerCase()) {
      return NextResponse.json({ error: 'Invalid reset token' }, { status: 400 });
    }

    if (getPasswordFingerprint(user.password) !== verification.payload.passwordFingerprint) {
      return NextResponse.json(
        { error: 'This reset link has already been used or is no longer valid' },
        { status: 400 }
      );
    }

    const isSamePassword = bcryptjs.compareSync(normalizedPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'Please choose a new password that is different from your current password' },
        { status: 400 }
      );
    }

    const hashedPassword = bcryptjs.hashSync(normalizedPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: 'Password reset successful. You can now sign in with your new password.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
