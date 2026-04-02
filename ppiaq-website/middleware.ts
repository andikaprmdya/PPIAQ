import { NextRequest, NextResponse } from 'next/server';

const CANONICAL_HOST = 'ppiaqueensland.org';
const CANONICAL_URL = `https://${CANONICAL_HOST}`;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') ?? '';

  // Consolidate public traffic onto the custom domain so crawlers pick up
  // the correct favicon, metadata, and canonical URL instead of the Vercel host.
  if (
    process.env.NODE_ENV === 'production' &&
    host.endsWith('.vercel.app')
  ) {
    const redirectUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, CANONICAL_URL);
    return NextResponse.redirect(redirectUrl, 308);
  }

  // Get user session cookies
  const userEmail = request.cookies.get('userEmail')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  // Admin routes - require authentication AND admin role
  if (pathname.startsWith('/admin')) {
    if (!userEmail) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (userRole !== 'ADMIN') {
      // Curator users have their own dashboard entrypoint
      if (userRole === 'CURATOR') {
        return NextResponse.redirect(new URL('/curator/events', request.url));
      }
      // Authenticated but not admin - redirect to community board
      return NextResponse.redirect(new URL('/community-board', request.url));
    }
  }

  // Curator routes - require authentication AND curator/admin role
  if (pathname.startsWith('/curator')) {
    if (!userEmail) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (userRole !== 'CURATOR' && userRole !== 'ADMIN') {
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
  matcher: [
    '/((?!api|_next/static|_next/image).*)',
  ],
};
