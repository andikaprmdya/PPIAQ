import { NextRequest, NextResponse } from 'next/server';
import { unrejectUser } from '@/lib/database/db';
import { sendEmail, getUnrejectTemplate } from '@/lib/email/brevo';
import { checkAdmin } from '@/lib/auth/check-admin';

export async function POST(request: NextRequest) {
  try {
    const adminUser = await checkAdmin();
    if (!adminUser) {
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

    // Unreject the user (change status back to pending)
    const user = await unrejectUser(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Send email notification to user about unreject
    const emailTemplate = getUnrejectTemplate(user.firstName, user.lastName);
    await sendEmail({
      to: [{ email: user.email, name: `${user.firstName} ${user.lastName}` }],
      subject: 'Aplikasi Membership Anda Akan Dievaluasi Ulang - PPIAQ',
      htmlContent: emailTemplate,
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'User unreject successful. Status changed back to pending and notification email sent.',
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/admin/users/unreject error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
