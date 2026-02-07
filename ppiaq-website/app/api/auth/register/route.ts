import { NextRequest, NextResponse } from 'next/server';
import { registerUser, getUserByEmail } from '@/lib/database/db';
import { sendEmail, getMembershipApplicationTemplate } from '@/lib/email/brevo';

export async function POST(request: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      nationality,
      educationLevel,
      university,
      major,
      birthDate,
      membershipType,
      paymentProofUrl,
      phoneNumber,
      studentId,
    } = await request.json();

    // Validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !nationality ||
      !educationLevel ||
      !university ||
      !major ||
      !birthDate ||
      !membershipType ||
      !paymentProofUrl
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (getUserByEmail(email)) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Register user with status 'pending' (requires admin approval)
    const user = registerUser(
      firstName,
      lastName,
      email,
      password,
      nationality,
      educationLevel,
      university,
      major,
      birthDate,
      membershipType,
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
                <p><strong>Nationality:</strong> ${nationality}</p>
                <p><strong>Birth Date:</strong> ${birthDate}</p>
                <p><strong>Membership Type:</strong> ${membershipType}</p>
                <p><strong>Registration Date:</strong> ${new Date().toLocaleString('en-US')}</p>
              </div>
              <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                <a href="http://localhost:3000/admin/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #B64847; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
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
    const { password: _, ...userWithoutPassword } = user;

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
