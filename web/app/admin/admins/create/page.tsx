export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreateAdminClient from './_components/create-admin-client';

export default async function CreateAdminPage() {
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

    if (!profile?.is_super_admin) {
        redirect('/admin/admins');
    }

    return (
        <CreateAdminClient />
    );
}
