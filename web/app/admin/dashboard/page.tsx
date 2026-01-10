export const dynamic = 'force-dynamic';

import { getAdminDashboardData } from '../_actions/adminActions';
import AdminDashboardClient from './_components/admin-dashboard-client';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profileResult } = await (supabase
        .from('profiles') as any)
        .select('full_name')
        .eq('user_id', user.id)
        .single();

    const profile = profileResult as any;

    const dashboardResult = await getAdminDashboardData();

    if (!dashboardResult.success) {
        // This will be caught by error.tsx
        throw new Error(dashboardResult.error || 'Failed to load dashboard');
    }

    return (
        <AdminDashboardClient
            stats={dashboardResult.data?.stats}
            recentActions={dashboardResult.data?.recentActions || []}
            adminName={profile?.full_name || 'Admin'}
        />
    );
}
