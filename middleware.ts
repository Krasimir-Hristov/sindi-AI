import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check authentication via cookie - FIRST LAYER (quick check)
  // This is NOT a security check, just a quick filter
  // Real validation happens in server components
  // Supabase stores auth token with project-specific key: sb-<project-ref>-auth-token
  const cookies = request.cookies;
  const hasAuthCookie = Array.from(cookies.getAll()).some(
    (cookie) =>
      cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
  );

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/signup'];
  const isPublicPath = publicPaths.includes(pathname);

  // Root path redirect logic
  if (pathname === '/') {
    if (hasAuthCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If user has auth cookie and tries to access login/signup, redirect to dashboard
  // They will be properly validated in the dashboard server component
  if (hasAuthCookie && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user has NO auth cookie and tries to access protected route, redirect to login
  // This is just UX optimization - real security is in server components
  if (!hasAuthCookie && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
