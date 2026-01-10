export const dynamic = 'force-dynamic';

import { getAdminActionsAction } from '../_actions/adminActions';
import AuditTrailClient from './_components/audit-trail-client';

export default async function AuditTrailPage() {
    const result = await getAdminActionsAction(100);

    if (!result.success) {
        throw new Error(result.error || 'Failed to load audit logs');
    }

    return (
        <AuditTrailClient initialActions={result.data || []} />
    );
}
