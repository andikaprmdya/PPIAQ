import { NextRequest, NextResponse } from 'next/server';
import { submitContactMessage } from '@/lib/database/db';

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
