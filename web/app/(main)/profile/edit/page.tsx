export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getProfile } from '@/app/actions/profile';
import EditProfileClient from './_components/edit-profile-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edit Profile | SafeSpace',
    description: 'Update your personal information and profile settings.',
};

export default async function EditProfilePage() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
        redirect('/auth/login');
    }

    const { data: profile, error } = await getProfile(user.id);

    if (error || !profile) {
        // Optionally redirect or show error
    }

    return (
        <EditProfileClient
            user={user}
            profile={profile}
        />
    );
}
