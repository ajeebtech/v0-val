import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const publicPaths = [
  '/login',
  '/signup',
  '/forgot-password',
  '/auth/callback',
];

const protectedPaths = [
  '/dashboard',
  '/profile',
  // Add other protected paths here
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Skip middleware for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return res;
  }

  // Create a Supabase client
  const supabase = createMiddlewareClient({ req, res });

  // Get the session
  const { data: { session } } = await supabase.auth.getSession();

  // If no session and trying to access a protected path, redirect to login
  if (!session && protectedPaths.some(path => pathname.startsWith(path))) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If session exists and trying to access auth pages, redirect to dashboard
  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
