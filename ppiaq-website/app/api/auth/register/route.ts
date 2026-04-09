import { NextRequest, NextResponse } from 'next/server';
import { registerUser, getUserByEmail } from '@/lib/database/db';
import { sendEmail, getMembershipApplicationTemplate } from '@/lib/email/brevo';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import {
  isAssociateNationality,
  ORDINARY_NATIONALITY,
} from '@/lib/countries';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 5 registrations per IP per minute
    const ip = getClientIp(request);
    const rl = rateLimit(`register:${ip}`, { limit: 5, windowSec: 60 });
    if (!rl.success) {
      return NextResponse.json(
        { error: `Too many registration attempts. Try again in ${rl.retryAfter}s.` },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const {
      firstName,
      lastName,
      email,
      password,
      nationality,
      educationLevel,
      university,
      major,
      expectedGraduationDate,
      expectedGraduationSemester,
      expectedGraduationYear,
      birthDate,
      membershipType,
      paymentProofUrl,
      phoneNumber,
      studentId,
    } = await request.json();

    const normalizedMembershipTypeRaw = String(membershipType || '').toLowerCase();
    const normalizedNationality = String(nationality || '').trim();
    const normalizedExpectedGraduation = String(
      expectedGraduationDate ||
      [expectedGraduationSemester, expectedGraduationYear].filter(Boolean).join(' ')
    ).trim();

    // Validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !normalizedNationality ||
      !educationLevel ||
      !university ||
      !major ||
      !normalizedExpectedGraduation ||
      !birthDate ||
      !normalizedMembershipTypeRaw ||
      !paymentProofUrl
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['ordinary', 'associate'].includes(normalizedMembershipTypeRaw)) {
      return NextResponse.json(
        { error: 'Invalid membership type' },
        { status: 400 }
      );
    }

    const normalizedMembershipType = normalizedMembershipTypeRaw as 'ordinary' | 'associate';

    if (normalizedMembershipType === 'ordinary' && normalizedNationality !== ORDINARY_NATIONALITY) {
      return NextResponse.json(
        { error: 'Ordinary membership is only available for Indonesian nationality' },
        { status: 400 }
      );
    }

    if (normalizedMembershipType === 'associate') {
      if (normalizedNationality === ORDINARY_NATIONALITY) {
        return NextResponse.json(
          { error: 'Associate membership must use non-Indonesian nationality' },
          { status: 400 }
        );
      }

      if (!isAssociateNationality(normalizedNationality)) {
        return NextResponse.json(
          { error: 'Invalid nationality for associate membership' },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (await getUserByEmail(email)) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Register user with status 'pending' (requires admin approval)
    const user = await registerUser(
      firstName,
      lastName,
      email,
      password,
      normalizedNationality,
      educationLevel,
      university,
      major,
      normalizedExpectedGraduation,
      birthDate,
      normalizedMembershipType,
      paymentProofUrl,
      phoneNumber,
      studentId
    );

    // Send email notification to user
    const emailTemplate = getMembershipApplicationTemplate(firstName, lastName, 'pending');
    await sendEmail({
      to: [{ email, name: `${firstName} ${lastName}` }],
      subject: 'PPIAQ Membership Application - Pending Review',
      htmlContent: emailTemplate,
    });

    // Send notification to PPIAQ admin
    const adminNotificationTemplate = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #B64847; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">📝 New Membership Application Received</h1>
            </div>
            <div style="padding: 20px;">
              <p>A new member has registered for PPIAQ membership!</p>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phoneNumber || 'Not provided'}</p>
                <p><strong>Student ID:</strong> ${studentId || 'Not provided'}</p>
                <p><strong>University:</strong> ${university}</p>
                <p><strong>Major:</strong> ${major}</p>
                <p><strong>Education Level:</strong> ${educationLevel}</p>
                <p><strong>Expected Graduation:</strong> ${normalizedExpectedGraduation}</p>
                <p><strong>Nationality:</strong> ${normalizedNationality}</p>
                <p><strong>Birth Date:</strong> ${birthDate}</p>
                <p><strong>Membership Type:</strong> ${normalizedMembershipType}</p>
                <p><strong>Registration Date:</strong> ${new Date().toLocaleString('en-US')}</p>
              </div>
              <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ppiaqueensland.org'}/admin/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #B64847; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Review Application in Admin Panel
                </a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
    await sendEmail({
      to: [{ email: 'qld@ppi-australia.org', name: 'PPIAQ Admin' }],
      subject: `New Member Registration: ${firstName} ${lastName}`,
      htmlContent: adminNotificationTemplate,
    });

    // Return user data without password
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as { password?: string }).password;

    return NextResponse.json(
      {
        message: 'Registration successful! Your application is pending admin approval. Check your email for confirmation.',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
