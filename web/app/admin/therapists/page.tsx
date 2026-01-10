export const dynamic = 'force-dynamic';

import { getAllTherapistsAction } from '../_actions/adminActions';
import TherapistsListClient from './_components/therapists-list-client';

export default async function AllTherapistsPage() {
    const result = await getAllTherapistsAction();

    if (!result.success) {
        throw new Error(result.error || 'Failed to load therapists');
    }

    return (
        <TherapistsListClient initialTherapists={result.data || []} />
    );
}
