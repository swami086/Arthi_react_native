export const dynamic = 'force-dynamic';

import { getAllAdminsAction } from '../_actions/adminActions';
import AdminsListClient from './_components/admins-list-client';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminManagementPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Verify current user is super admin
    const { data: profile } = await (supabase
        .from('profiles') as any)
        .select('is_super_admin')
        .eq('user_id', user.id)
        .single();

    const result = await getAllAdminsAction();

    if (!result.success) {
        throw new Error(result.error || 'Failed to load admins');
    }

    return (
        <AdminsListClient
            initialAdmins={result.data || []}
            isSuperAdmin={!!profile?.is_super_admin}
            currentUserId={user?.id || ''}
        />
    );
}
