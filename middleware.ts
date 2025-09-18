import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a new response that we can modify
  response = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Forward the Set-Cookie header to the response
          response.cookies.set({
            name,
            value,
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            path: '/',
          });
        },
        remove(name: string, options: CookieOptions) {
          // Forward the Set-Cookie header to the response
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
            path: '/',
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();
  const url = new URL(request.url);

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/auth/callback',
    '/_next',
    '/favicon.ico',
    '/api/auth',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/api',
    '/_vercel',
    '/_next/static',
    '/_next/image',
    '/public',
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    route === url.pathname || 
    url.pathname.startsWith(`${route}/`) ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.json')
  );

  // If it's a public route, continue without redirecting
  if (isPublicRoute) {
    return response;
  }

  // Handle API routes
  if (url.pathname.startsWith('/api/')) {
    // For API routes, we don't redirect, just verify the session
    if (!session && !url.pathname.startsWith('/api/auth/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return response;
  }

  // Redirect to login if user is not authenticated and trying to access protected routes
  if (!session) {
    // Don't redirect if we're already going to login
    if (url.pathname !== '/login') {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectedFrom', url.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // If user is authenticated and trying to access login/signup, redirect to dashboard or the intended page
  if (['/login', '/signup', '/'].includes(url.pathname)) {
    const redirectTo = url.searchParams.get('redirectedFrom') || '/dashboard';
    // Prevent redirect loops by checking if we're already going to the same path
    if (url.pathname !== redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
