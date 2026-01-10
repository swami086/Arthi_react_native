import { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function filterTherapistsByExpertise(therapists: Profile[], expertise: string | null) {
    if (!expertise || expertise === 'All Filters') return therapists;
    return therapists.filter(therapist =>
        therapist.expertise_areas?.some(area =>
            area.toLowerCase().includes(expertise.toLowerCase())
        )
    );
}

export function searchTherapists(therapists: Profile[], query: string) {
    if (!query) return therapists;
    const lowerQuery = query.toLowerCase();
    return therapists.filter(therapist =>
        therapist.full_name?.toLowerCase().includes(lowerQuery) ||
        therapist.bio?.toLowerCase().includes(lowerQuery) ||
        therapist.specialization?.toLowerCase().includes(lowerQuery) ||
        therapist.expertise_areas?.some(area => area.toLowerCase().includes(lowerQuery))
    );
}

export function sortTherapists(therapists: Profile[], sortBy: string) {
    const sorted = [...therapists];
    switch (sortBy) {
        case 'rating':
            return sorted.sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0));
        case 'experience':
            return sorted.sort((a, b) => (b.years_of_experience || 0) - (a.years_of_experience || 0));
        default:
            return sorted;
    }
}

export function applyTherapistFilters(
    therapists: Profile[],
    filters: {
        query: string;
        expertise: string | null;
        sortBy?: string;
    }
) {
    let result = therapists;
    result = searchTherapists(result, filters.query);
    result = filterTherapistsByExpertise(result, filters.expertise);
    if (filters.sortBy) {
        result = sortTherapists(result, filters.sortBy);
    }
    return result;
}
