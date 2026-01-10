import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/onboarding', '/api/test-rollbar', '/auth/callback', '/api/local-log'];

export async function middleware(request: NextRequest) {
    const { supabase, response, user } = await updateSession(request);
    const path = request.nextUrl.pathname;
    const onboardingCompleted = request.cookies.get('onboarding_completed')?.value === 'true';

    // Public routes handling
    if (publicRoutes.some(route => path === route || path.startsWith(route + '/'))) {
        // If user already completed onboarding and tries to go to onboarding, send them home if authenticated
        if (user && onboardingCompleted && path.startsWith('/onboarding')) {
            return NextResponse.redirect(new URL('/home', request.url));
        }
        return response;
    }

    // Redirect unauthenticated users
    if (!user) {
        // If not authenticated and trying to access private routes, send to login
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url, {
            headers: response.headers
        });
    }

    // Authenticated users flow

    // Check onboarding status for authenticated users
    if (!onboardingCompleted && !path.startsWith('/onboarding')) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding/welcome';
        return NextResponse.redirect(url, { headers: response.headers });
    }

    // Fetch user profile and role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, approval_status')
        .eq('user_id', user.id)
        .single();

    // Handle pending therapist approval
    if (profile?.role === 'therapist' && profile?.approval_status === 'pending') {
        if (path !== '/pending-approval' && !path.startsWith('/onboarding')) {
            const url = request.nextUrl.clone();
            url.pathname = '/pending-approval';
            return NextResponse.redirect(url, { headers: response.headers });
        }
        return response;
    }

    // Role-based routing
    if (profile?.role === 'patient' && path.startsWith('/therapist')) {
        const url = request.nextUrl.clone();
        url.pathname = '/home';
        return NextResponse.redirect(url, { headers: response.headers });
    }

    if (profile?.role === 'therapist' && !path.startsWith('/therapist') && !path.startsWith('/profile') && !path.startsWith('/onboarding')) {
        const url = request.nextUrl.clone();
        url.pathname = '/therapist/home';
        return NextResponse.redirect(url, { headers: response.headers });
    }

    if (profile?.role === 'admin' && !path.startsWith('/admin') && !path.startsWith('/onboarding')) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/dashboard';
        return NextResponse.redirect(url, { headers: response.headers });
    }

    // HTTP Caching Strategy
    if (path.startsWith('/_next/static')) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (path.startsWith('/api/') && !path.includes('/auth/')) {
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

