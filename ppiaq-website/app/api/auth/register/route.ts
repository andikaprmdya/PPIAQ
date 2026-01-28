import { NextRequest, NextResponse } from 'next/server';
import {
  registerUser,
  getUserByEmail,
  getUserByUsername,
} from '@/lib/database/db';

export async function POST(request: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      email,
      username,
      password,
      membershipType,
      university,
    } = await request.json();

    // Validation
    if (!firstName || !lastName || !email || !username || !password || !membershipType || !university) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Check if username already exists
    if (getUserByUsername(username)) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Register user
    const user = registerUser(
      firstName,
      lastName,
      email,
      username,
      password,
      membershipType,
      university
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
