import { NextRequest, NextResponse } from 'next/server';
import { getUsersByStatus, updateUser, getUserById } from '@/lib/database/db';
import { checkAdmin } from '@/lib/auth/check-admin';
import { isEligibleForMembershipList } from '@/lib/membership-rules';
import { getMembershipApplicationTemplate, sendEmail } from '@/lib/email/brevo';
import { validateFirstLastName } from '@/lib/name-validation';

export async function GET(request: NextRequest) {
  try {
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get status query parameter
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status parameter' },
        { status: 400 }
      );
    }

    const users = await getUsersByStatus(status);
    const filteredUsers = users.filter((member) =>
      isEligibleForMembershipList({
        university: member.university,
        nationality: member.nationality,
      })
    );

    // Return users without password
    const usersWithoutPassword = filteredUsers.map((member) => {
      const userWithoutPassword = { ...member };
      delete (userWithoutPassword as { password?: string }).password;
      return userWithoutPassword;
    });

    return NextResponse.json(usersWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminUser = await checkAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get userId from query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId (id query parameter) is required' },
        { status: 400 }
      );
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

    const previousStatus = String(existingUser.status || '').toUpperCase();
    const nextStatus = String(user.status || '').toUpperCase();
    const statusChanged = previousStatus !== nextStatus;

    if (statusChanged) {
      const statusForTemplateMap: Record<string, 'pending' | 'approved' | 'rejected'> = {
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected',
      };
      const statusForTemplate = statusForTemplateMap[nextStatus];

      if (statusForTemplate) {
        try {
          const rejectionReason =
            typeof updates?.rejectionReason === 'string' && updates.rejectionReason.trim()
              ? updates.rejectionReason.trim()
              : user.rejectionReason || undefined;

          const emailTemplate = getMembershipApplicationTemplate(
            user.firstName,
            user.lastName,
            statusForTemplate,
            rejectionReason
          );

          await sendEmail({
            to: [{ email: user.email, name: `${user.firstName} ${user.lastName}` }],
            subject: `PPIAQ Membership Application - ${nextStatus}`,
            htmlContent: emailTemplate,
          });
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
        }
      }
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
    console.error('PUT /api/admin/users error:', error);
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
