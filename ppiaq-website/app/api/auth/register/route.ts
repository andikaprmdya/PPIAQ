import { NextRequest, NextResponse } from 'next/server';
import { registerUser, getUserByEmail } from '@/lib/database/db';

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
      paymentProofUrl
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'Registration successful! Your application is pending admin approval.',
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
