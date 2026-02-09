import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, rejectUser, isAdmin } from '@/lib/database/db';
import { sendEmail, getMembershipApplicationTemplate } from '@/lib/email/brevo';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
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

    // Get userId and reason from request body
    const { userId, reason } = await request.json();

    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'userId and reason are required' },
        { status: 400 }
      );
    }

    // Reject the user
    const user = await rejectUser(userId, adminUser.id, reason);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Send email notification to user
    const emailTemplate = getMembershipApplicationTemplate(user.firstName, user.lastName, 'rejected', reason);
    await sendEmail({
      to: [{ email: user.email, name: `${user.firstName} ${user.lastName}` }],
      subject: 'PPIAQ Membership Application - Update',
      htmlContent: emailTemplate,
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'User rejected successfully and notification email sent',
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/admin/users/reject error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
