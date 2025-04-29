import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request);

  // Handle routing based on authentication status
  const { data: { session } } = await supabase.auth.getSession();

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isProtectedRoute = !isAuthRoute && 
                           !request.nextUrl.pathname.startsWith('/_next') && 
                           !request.nextUrl.pathname.startsWith('/api') &&
                           request.nextUrl.pathname !== '/';

  if (!session && isProtectedRoute) {
    // Redirect unauthenticated users to login page
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated but tries to access auth routes (login/signup)
  if (session && isAuthRoute) {
    // Redirect authenticated users to the assessment page
    return NextResponse.redirect(new URL('/assessment', request.url));
  }

  return response;
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except static files, public files, and API routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 