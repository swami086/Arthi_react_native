import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { addBreadcrumb, reportError } from '@/lib/rollbar-utils';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];

export async function getMentors(supabase: SupabaseClient) {
    addBreadcrumb('Fetching mentors', 'mentor_service.getMentors', 'info');
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'mentor')
            .eq('approval_status', 'approved');

        if (error) {
            throw error;
        }

        return data as Profile[];
    } catch (error) {
        reportError(error, 'mentor_service.getMentors');
        throw error;
    }
}

export async function getMentorById(supabase: SupabaseClient, id: string) {
    addBreadcrumb('Fetching mentor by ID', 'mentor_service.getMentorById', 'info', { id });
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', id)
            .eq('role', 'mentor')
            .single();

        if (error) {
            throw error;
        }

        return data as Profile;
    } catch (error) {
        reportError(error, 'mentor_service.getMentorById');
        throw error;
    }
}

export async function getMentorReviews(supabase: SupabaseClient, mentorId: string, limit = 5) {
    addBreadcrumb('Fetching mentor reviews', 'mentor_service.getMentorReviews', 'info', { mentorId, limit });
    try {
        // We need to join with profiles to get mentee names.
        // Assuming reviews has a mentee_id FK to profiles.id
        // The join syntax depends on the exact relationship name. 
        // Often supabase-js infers it, or we use explicit strict typing.
        // For now, selecting specific fields.
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                mentee:profiles!reviews_mentee_id_fkey(full_name, avatar_url)
            `)
            .eq('mentor_id', mentorId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        return data as any[]; // Cast to any to handle the joined data shape easily for now
    } catch (error) {
        reportError(error, 'mentor_service.getMentorReviews');
        return [];
    }
}

export async function getMentorAvailability(supabase: SupabaseClient, mentorId: string) {
    addBreadcrumb('Fetching mentor availability', 'mentor_service.getMentorAvailability', 'info', { mentorId });
    try {
        const { data, error } = await supabase
            .from('mentor_availability' as any)
            .select('*')
            .eq('mentor_id', mentorId)
            .eq('is_booked', false)
            .gt('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(5);

        if (error) {
            reportError(error, 'Error fetching mentor availability details', { mentorId });
            return [];
        }

        addBreadcrumb('Mentor availability fetched', 'mentor_service.getMentorAvailability.success', 'info', {
            mentorId,
            count: data?.length || 0
        });

        return data || [];
    } catch (error) {
        reportError(error, 'mentor_service.getMentorAvailability');
        return [];
    }
}

export async function searchAvailableMentees(supabase: SupabaseClient, query: string = '', limit = 10) {
    addBreadcrumb('Searching available mentees', 'mentor_service.searchAvailableMentees', 'info', { query });
    try {
        let builder = supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                avatar_url,
                email,
                role
            `)
            .eq('role', 'mentee');

        if (query) {
            builder = builder.ilike('full_name', `%${query}%`);
        }

        const { data, error } = await builder.limit(limit);

        if (error) throw error;

        return data.map(m => ({
            ...m,
            matchPercentage: Math.floor(Math.random() * (98 - 70) + 70)
        }));

    } catch (error) {
        reportError(error, 'mentor_service.searchAvailableMentees');
        return [];
    }
}

