import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get user email from cookie
  const userEmail = request.cookies.get('userEmail')?.value;

  // Admin routes - require authentication
  if (pathname.startsWith('/admin')) {
    if (!userEmail) {
      // Redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Protected routes - require authentication
  if (pathname === '/profile' || pathname === '/community-board') {
    if (!userEmail) {
      // Redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile', '/community-board'],
};
