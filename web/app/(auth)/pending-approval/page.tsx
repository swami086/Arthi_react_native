import { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import PendingApprovalContent from './_components/pending-approval-content';

export const metadata: Metadata = {
    title: 'Account Review | SafeSpace',
    description: 'Your mentor account is being reviewed.',
};

export default function PendingApprovalPage() {
    return <PendingApprovalContent />;
}
