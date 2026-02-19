import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getMembershipApplicationTemplate, getNewsletterSubscriptionTemplate } from '@/lib/email/brevo';
import { checkAdmin } from '@/lib/auth/check-admin';

export async function POST(request: NextRequest) {
  try {
    // Admin-only: verify session
    const adminUser = await checkAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { type, email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (type === 'membership-pending') {
      const htmlContent = getMembershipApplicationTemplate('Test', 'User', 'pending');
      const response = await sendEmail({
        to: [{ email, name: 'Test User' }],
        subject: 'PPIAQ Membership Application - Pending Review',
        htmlContent,
      });
      return NextResponse.json(
        {
          message: 'Membership pending email sent successfully',
          result: response,
        },
        { status: 200 }
      );
    } else if (type === 'membership-approved') {
      const htmlContent = getMembershipApplicationTemplate('Test', 'User', 'approved');
      const response = await sendEmail({
        to: [{ email, name: 'Test User' }],
        subject: 'PPIAQ Membership Application - Approved! ✓',
        htmlContent,
      });
      return NextResponse.json(
        {
          message: 'Membership approved email sent successfully',
          result: response,
        },
        { status: 200 }
      );
    } else if (type === 'membership-rejected') {
      const htmlContent = getMembershipApplicationTemplate('Test', 'User', 'rejected', 'Test rejection reason');
      const response = await sendEmail({
        to: [{ email, name: 'Test User' }],
        subject: 'PPIAQ Membership Application - Update',
        htmlContent,
      });
      return NextResponse.json(
        {
          message: 'Membership rejected email sent successfully',
          result: response,
        },
        { status: 200 }
      );
    } else if (type === 'newsletter') {
      const htmlContent = getNewsletterSubscriptionTemplate(email);
      const response = await sendEmail({
        to: [{ email }],
        subject: 'Welcome to PPIAQ Newsletter',
        htmlContent,
      });
      return NextResponse.json(
        {
          message: 'Newsletter confirmation email sent successfully',
          result: response,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid email type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
