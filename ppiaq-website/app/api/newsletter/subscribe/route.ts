import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/database/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Subscribe
    const subscriber = subscribeToNewsletter(email);

    return NextResponse.json(
      {
        message: 'Subscription successful',
        subscriber,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Subscription failed' },
      { status: 500 }
    );
  }
}
