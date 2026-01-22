export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getProfile } from '@/app/actions/profile';
import SettingsClient from '../../(main)/profile/settings/_components/settings-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings | SafeSpace Therapist',
    description: 'Manage your notifications, appearance, and account data.',
};

export default async function TherapistSettingsPage() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
        redirect('/login');
    }

    const { data: profile } = await getProfile(user.id);

    return (
        <SettingsClient
            user={user}
            profile={profile}
        />
    );
}
