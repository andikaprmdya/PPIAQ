import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import {
  createPasswordResetToken,
  getPasswordResetTokenTtlMinutes,
} from '@/lib/auth/password-reset';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { getPasswordResetTemplate, sendEmail } from '@/lib/email/brevo';

const GENERIC_SUCCESS_MESSAGE =
  'If an account with that email exists, we have sent a password reset link.';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`forgot-password:${ip}`, { limit: 5, windowSec: 300 });
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many reset attempts. Try again in ${rl.retryAfter}s.` },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const { email } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        firstName: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE }, { status: 200 });
    }

    const token = createPasswordResetToken(user.id, user.email, user.password);
    const resetUrl = new URL('/auth/reset-password', request.nextUrl.origin);
    resetUrl.searchParams.set('token', token);

    const expiresInMinutes = getPasswordResetTokenTtlMinutes();
    const htmlContent = getPasswordResetTemplate(user.firstName, resetUrl.toString(), expiresInMinutes);

    try {
      await sendEmail({
        to: [{ email: user.email, name: user.firstName }],
        subject: 'PPIAQ Password Reset Request',
        htmlContent,
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
