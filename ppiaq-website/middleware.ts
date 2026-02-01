import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/database/db';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get user email from cookie
  const userEmail = request.cookies.get('userEmail')?.value;

  // Admin routes - require role='admin'
  if (pathname.startsWith('/admin')) {
    if (!userEmail) {
      // Redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Get user from database
    const user = getUserByEmail(userEmail);

    if (!user) {
      // User not found, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (user.role !== 'admin') {
      // Not an admin, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protected routes - require authentication and approved status
  if (pathname === '/profile' || pathname === '/community-board') {
    if (!userEmail) {
      // Redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Get user from database
    const user = getUserByEmail(userEmail);

    if (!user) {
      // User not found, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (user.status !== 'approved') {
      // Not approved, redirect to home or pending page
      // For now, redirect to home with message in search params
      const url = new URL('/', request.url);
      url.searchParams.set(
        'message',
        user.status === 'pending'
          ? 'Your application is pending approval'
          : 'Your application was rejected'
      );
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile', '/community-board'],
};
