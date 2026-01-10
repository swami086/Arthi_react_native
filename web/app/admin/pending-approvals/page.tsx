export const dynamic = 'force-dynamic';

import { getPendingTherapistsAction } from '../_actions/adminActions';
import PendingApprovalsClient from './_components/pending-approvals-client';

export default async function PendingApprovalsPage() {
    const result = await getPendingTherapistsAction();

    if (!result.success) {
        throw new Error(result.error || 'Failed to load pending therapists');
    }

    return (
        <PendingApprovalsClient initialTherapists={result.data || []} />
    );
}
