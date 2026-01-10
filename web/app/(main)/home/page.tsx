export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { getPatientStats, getRecentActivity } from '@/lib/services/stats-service';
import { HomePageClient } from './_components/home-page-client';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { addBreadcrumb, reportError } from '@/lib/rollbar-utils';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Home - SafeSpace',
    description: 'Your SafeSpace dashboard',
};

export const revalidate = 60; // ISR

export default async function HomePage() {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            redirect('/login');
        }

        // Fetch user profile
        // Fetch user profile
        const { data: rawProfile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();
        const profile = rawProfile as any;

        if (profileError) {
            reportError(profileError, 'home_page.fetch_profile');
        }

        // Parallel data fetching for performance
        const [stats, recentActivity] = await Promise.all([
            getPatientStats(supabase, user.id),
            getRecentActivity(supabase, user.id)
        ]);

        addBreadcrumb('Home page data loaded', 'home.page_load', 'info', {
            userId: user.id,
            sessionCount: stats.totalSessions
        });

        // Extract first name from full name or use a default
        const firstName = profile?.full_name?.split(' ')[0] || 'Friend';

        return (
            <ErrorBoundary context="home_page_root">
                <HomePageClient
                    user={{
                        id: user.id,
                        firstName,
                        fullName: profile?.full_name || '',
                        avatarUrl: profile?.avatar_url || '',
                    }}
                    stats={stats}
                    recentActivity={recentActivity}
                />
            </ErrorBoundary>
        );

    } catch (error) {
        reportError(error, 'home_page.server_error');
        throw error; // Let the nearest error boundary handle it
    }
}
