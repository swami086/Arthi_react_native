export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getPendingTherapistRequests } from '@/app/actions/relationships';
import PendingRequestsClient from './_components/pending-requests-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Therapist Requests | SafeSpace',
    description: 'Manage pending therapist connection requests.',
};

export default async function PendingRequestsPage() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
        redirect('/auth/login');
    }

    // Fetch pending requests
    const requests = await getPendingTherapistRequests(user.id);

    return (
        <PendingRequestsClient
            user={user}
            initialRequests={requests}
        />
    );
}
