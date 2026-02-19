import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/database/db';
import { sendEmail, getNewsletterSubscriptionTemplate } from '@/lib/email/brevo';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 3 subscribe attempts per IP per minute
    const ip = getClientIp(request);
    const rl = rateLimit(`newsletter:${ip}`, { limit: 3, windowSec: 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${rl.retryAfter}s.` },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Subscribe to newsletter
    const subscriber = await subscribeToNewsletter(email);

    // Send confirmation email (non-blocking - subscription succeeds even if email fails)
    const emailTemplate = getNewsletterSubscriptionTemplate(email);
    try {
      await sendEmail({
        to: [{ email }],
        subject: 'Welcome to PPIAQ Newsletter',
        htmlContent: emailTemplate,
      });
    } catch (emailError) {
      console.error('POST /api/newsletter/subscribe - email send failed:', emailError);
      // Subscription still succeeds, email confirmation is best-effort
    }

    return NextResponse.json(
      {
        message: 'Successfully subscribed to newsletter. Check your email for confirmation.',
        subscriber,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/newsletter/subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
