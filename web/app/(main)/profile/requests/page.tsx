export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getPendingMentorRequests } from '@/app/actions/relationships';
import PendingRequestsClient from './_components/pending-requests-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mentor Requests | SafeSpace',
    description: 'Manage pending mentor connection requests.',
};

export default async function PendingRequestsPage() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
        redirect('/auth/login');
    }

    // Fetch pending requests
    const requests = await getPendingMentorRequests(user.id);

    return (
        <PendingRequestsClient
            user={user}
            initialRequests={requests}
        />
    );
}
