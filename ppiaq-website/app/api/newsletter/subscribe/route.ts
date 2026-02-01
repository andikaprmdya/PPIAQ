import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/database/db';

export async function POST(request: NextRequest) {
  try {
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
    const subscriber = subscribeToNewsletter(email);

    return NextResponse.json(
      {
        message: 'Successfully subscribed to newsletter',
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
