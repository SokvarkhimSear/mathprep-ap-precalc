import { NextResponse } from 'next/server';

/**
 * Next.js Route Middleware
 *
 * All lessons (/lessons), practice questions (/practice), formula sheets,
 * and AI tutoring features are temporarily 100% free and accessible to all users.
 *
 * Payment and subscription infrastructure (app/checkout/page.jsx, webhooks,
 * and database schemas) is preserved below in a dormant state.
 */
export function middleware(request) {
  // Dormant Premium Subscription Check (Preserved for future re-activation):
  // const isPremiumCookie = request.cookies.get('mathprep_is_premium')?.value === 'true';
  // const { pathname } = request.nextUrl;
  // if ((pathname.startsWith('/lessons') || pathname.startsWith('/practice')) && !isPremiumCookie) {
  //   return NextResponse.redirect(new URL('/checkout', request.url));
  // }

  // Allow all traffic to freely access /lessons, /practice, and all platform routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/lessons/:path*', '/practice/:path*'],
};
