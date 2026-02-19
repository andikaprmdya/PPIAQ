import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get user session cookies
  const userEmail = request.cookies.get('userEmail')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  // Admin routes - require authentication AND admin role
  if (pathname.startsWith('/admin')) {
    if (!userEmail) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (userRole !== 'ADMIN') {
      // Authenticated but not admin - redirect to community board
      return NextResponse.redirect(new URL('/community-board', request.url));
    }
  }

  // Protected routes - require authentication
  if (pathname === '/profile' || pathname === '/community-board') {
    if (!userEmail) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile', '/community-board'],
};
