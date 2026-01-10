import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
    reportError,
    reportInfo,
    addBreadcrumb,
    getTraceId,
    startTimer,
    endTimer
} from '@/lib/rollbar-utils';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';
    const traceId = getTraceId();

    addBreadcrumb('OAuth callback received', 'auth.callback', 'info', { hasCode: !!code, next, traceId });
    startTimer('auth.callback.exchange');

    if (code) {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
                reportError(error, 'auth.callback.exchange', { traceId });
                return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
            }

            const user = data.user;
            if (user) {
                // Check if profile exists
                const { data: profileResult, error: profileFetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                let profile = profileResult as any;

                if (profileFetchError && profileFetchError.code === 'PGRST116') {
                    // Profile doesn't exist, create one using metadata
                    const metadataRole = user.user_metadata.role || 'mentee';
                    addBreadcrumb('Creating profile for OAuth user', 'auth.callback', 'info', {
                        userId: user.id,
                        role: metadataRole
                    });

                    const { data: newProfile, error: insertError } = await supabase
                        .from('profiles')
                        .insert({
                            user_id: user.id,
                            full_name: user.user_metadata.full_name || user.email?.split('@')[0],
                            role: metadataRole,
                            avatar_url: user.user_metadata.avatar_url,
                            approval_status: metadataRole === 'mentor' ? 'pending' : null,
                        } as any)
                        .select()
                        .single();

                    if (insertError) {
                        reportError(insertError, 'auth.callback.profileInsert', { userId: user.id, traceId });
                    } else {
                        profile = newProfile;
                    }
                }

                endTimer('auth.callback.exchange', 'auth.callback', { userId: user.id, traceId });
                reportInfo('OAuth login successful', 'auth.callback', { userId: user.id, traceId });

                // Redirect based on role and approval status
                const role = profile?.role || 'mentee';
                const status = profile?.approval_status;

                if (role === 'mentor' && status === 'pending') {
                    return NextResponse.redirect(`${origin}/pending-approval`);
                } else if (role === 'mentor') {
                    return NextResponse.redirect(`${origin}/mentor/home`);
                } else if (role === 'admin') {
                    return NextResponse.redirect(`${origin}/admin/dashboard`);
                } else {
                    // Default to mentee home or next param
                    return NextResponse.redirect(`${origin}${next === '/' ? '/home' : next}`);
                }
            }
        } catch (error) {
            reportError(error, 'auth.callback.catch', { traceId });
            return NextResponse.redirect(`${origin}/login?error=unexpected_error`);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_code_missing`);
}

