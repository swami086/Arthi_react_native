export const dynamic = 'force-dynamic';

import { getAllPatientsAction } from '../_actions/adminActions';
import PatientsListClient from './_components/patients-list-client';

export default async function AllPatientsPage() {
    const result = await getAllPatientsAction();

    if (!result.success) {
        throw new Error(result.error || 'Failed to load patients');
    }

    return (
        <PatientsListClient initialPatients={result.data || []} />
    );
}
