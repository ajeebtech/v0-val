import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public paths that don't require authentication
const publicPaths = [
  '/login',
  '/signup',
  '/forgot-password',
  '/auth/callback',
  '/_next',
  '/favicon.ico',
  '/api',
  '/_vercel',
  '/_next/static',
  '/_next/image',
  '/public',
  '/env-test', // For testing
];

// List of protected paths that require authentication
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

  // Check for auth token in localStorage (handled client-side)
  // The actual authentication check will be done in the page components
  
  // For protected paths, we'll let the client-side handle the redirect
  // This avoids cookie parsing issues in the middleware
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    // The actual redirect will be handled by the client-side AuthProvider
    return res;
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
