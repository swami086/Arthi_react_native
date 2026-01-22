import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { addBreadcrumb, reportError } from '@/lib/rollbar-utils';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];

export async function getTherapists(supabase: SupabaseClient) {
    addBreadcrumb('Fetching therapists', 'therapist_service.getTherapists', 'info');
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'therapist')
            .eq('approval_status', 'approved');

        if (error) {
            throw error;
        }

        return data as Profile[];
    } catch (error) {
        reportError(error, 'therapist_service.getTherapists');
        throw error;
    }
}

export async function getTherapistById(supabase: SupabaseClient, id: string) {
    addBreadcrumb('Fetching therapist by ID', 'therapist_service.getTherapistById', 'info', { id });
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', id)
            .eq('role', 'therapist')
            .single();

        if (error) {
            throw error;
        }

        return data as Profile;
    } catch (error) {
        reportError(error, 'therapist_service.getTherapistById');
        throw error;
    }
}

export async function getTherapistReviews(supabase: SupabaseClient, therapistId: string, practiceId?: string, limit = 5) {
    addBreadcrumb('Fetching therapist reviews', 'therapist_service.getTherapistReviews', 'info', { therapistId, limit });
    try {
        // We need to join with profiles to get patient names.
        // Assuming reviews has a patient_id FK to profiles.id
        // The join syntax depends on the exact relationship name. 
        // Often supabase-js infers it, or we use explicit strict typing.
        // For now, selecting specific fields.
        let query = supabase
            .from('reviews')
            .select(`
                *,
                patient:profiles!reviews_mentee_id_fkey(user_id, full_name, avatar_url)
            `)
            .eq('therapist_id', therapistId);

        if (practiceId) {
            query = query.eq('practice_id', practiceId);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        return data as any[]; // Cast to any to handle the joined data shape easily for now
    } catch (error) {
        reportError(error, 'therapist_service.getTherapistReviews');
        return [];
    }
}

export async function getTherapistAvailability(supabase: SupabaseClient, therapistId: string, practiceId?: string) {
    addBreadcrumb('Fetching therapist availability', 'therapist_service.getTherapistAvailability', 'info', { therapistId });
    try {
        let queryBuilder = supabase
            .from('therapist_availability' as any)
            .select('*')
            .eq('therapist_id', therapistId)
            .eq('is_booked', false)
            .gt('start_time', new Date().toISOString());

        if (practiceId) {
            queryBuilder = queryBuilder.eq('practice_id', practiceId);
        }

        const { data, error } = await queryBuilder
            .order('start_time', { ascending: true })
            .limit(5);

        if (error) {
            reportError(error, 'Error fetching therapist availability details', { therapistId });
            return [];
        }

        addBreadcrumb('Therapist availability fetched', 'therapist_service.getTherapistAvailability.success', 'info', {
            therapistId,
            count: data?.length || 0
        });

        return data || [];
    } catch (error) {
        reportError(error, 'therapist_service.getTherapistAvailability');
        return [];
    }
}

export async function searchAvailablePatients(supabase: SupabaseClient, query: string = '', limit = 10, practiceId?: string) {
    addBreadcrumb('Searching available patients', 'therapist_service.searchAvailablePatients', 'info', { query, practiceId });
    try {
        let builder = supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url, role')
            .eq('role', 'patient');

        if (practiceId) {
            builder = builder.eq('practice_id', practiceId);
        }

        if (query) {
            builder = builder.ilike('full_name', `%${query}%`);
        }

        const { data, error } = await builder.limit(limit);

        if (error) throw error;

        return data.map(m => ({
            ...m,
            id: m.user_id,
            email: 'hidden@example.com', // Email is not exposed in public profile search
            matchPercentage: Math.floor(Math.random() * (98 - 70) + 70)
        }));

    } catch (error) {
        reportError(error, 'therapist_service.searchAvailablePatients');
        return [];
    }
}

