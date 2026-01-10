import { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function filterMentorsByExpertise(mentors: Profile[], expertise: string | null) {
    if (!expertise || expertise === 'All Filters') return mentors;
    return mentors.filter(mentor =>
        mentor.expertise_areas?.some(area =>
            area.toLowerCase().includes(expertise.toLowerCase())
        )
    );
}

export function searchMentors(mentors: Profile[], query: string) {
    if (!query) return mentors;
    const lowerQuery = query.toLowerCase();
    return mentors.filter(mentor =>
        mentor.full_name?.toLowerCase().includes(lowerQuery) ||
        mentor.bio?.toLowerCase().includes(lowerQuery) ||
        mentor.specialization?.toLowerCase().includes(lowerQuery) ||
        mentor.expertise_areas?.some(area => area.toLowerCase().includes(lowerQuery))
    );
}

export function sortMentors(mentors: Profile[], sortBy: string) {
    const sorted = [...mentors];
    switch (sortBy) {
        case 'rating':
            return sorted.sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0));
        case 'experience':
            return sorted.sort((a, b) => (b.years_of_experience || 0) - (a.years_of_experience || 0));
        default:
            return sorted;
    }
}

export function applyMentorFilters(
    mentors: Profile[],
    filters: {
        query: string;
        expertise: string | null;
        sortBy?: string;
    }
) {
    let result = mentors;
    result = searchMentors(result, filters.query);
    result = filterMentorsByExpertise(result, filters.expertise);
    if (filters.sortBy) {
        result = sortMentors(result, filters.sortBy);
    }
    return result;
}
