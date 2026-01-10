export const dynamic = 'force-dynamic';

import { getAllMenteesAction } from '../_actions/adminActions';
import MenteesListClient from './_components/mentees-list-client';

export default async function AllMenteesPage() {
    const result = await getAllMenteesAction();

    if (!result.success) {
        throw new Error(result.error || 'Failed to load mentees');
    }

    return (
        <MenteesListClient initialMentees={result.data || []} />
    );
}
