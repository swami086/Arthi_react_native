export const dynamic = 'force-dynamic';

import { getPendingMentorsAction } from '../_actions/adminActions';
import PendingApprovalsClient from './_components/pending-approvals-client';

export default async function PendingApprovalsPage() {
    const result = await getPendingMentorsAction();

    if (!result.success) {
        throw new Error(result.error || 'Failed to load pending mentors');
    }

    return (
        <PendingApprovalsClient initialMentors={result.data || []} />
    );
}
