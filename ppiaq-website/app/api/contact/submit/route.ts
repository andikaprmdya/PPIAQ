import { NextRequest, NextResponse } from 'next/server';
import { submitContactMessage } from '@/lib/database/db';
import { sendEmail } from '@/lib/email/brevo';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Submit message
    const contactMessage = submitContactMessage(name, email, message);

    // Send email notification to PPIAQ with all contact details
    const contactEmailTemplate = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #B64847; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">📧 New Message from Contact Form</h1>
            </div>
            <div style="padding: 20px;">
              <p>A new message has been submitted through the contact form.</p>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
              </div>
              <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #B64847; margin: 20px 0;">
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap; word-wrap: break-word;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
              <p style="font-size: 12px; color: #999; margin-top: 20px;">
                Submitted on: ${new Date().toLocaleString('en-US')}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: [{ email: 'qld@ppi-australia.org', name: 'PPIAQ Admin' }],
      subject: `New Contact Form Submission from ${name}`,
      htmlContent: contactEmailTemplate,
    });

    return NextResponse.json(
      {
        message: 'Message submitted successfully',
        data: contactMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit message' },
      { status: 500 }
    );
  }
}
