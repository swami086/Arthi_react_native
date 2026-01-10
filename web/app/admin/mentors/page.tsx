export const dynamic = 'force-dynamic';

import { getAllMentorsAction } from '../_actions/adminActions';
import MentorsListClient from './_components/mentors-list-client';

export default async function AllMentorsPage() {
    const result = await getAllMentorsAction();

    if (!result.success) {
        throw new Error(result.error || 'Failed to load mentors');
    }

    return (
        <MentorsListClient initialMentors={result.data || []} />
    );
}
