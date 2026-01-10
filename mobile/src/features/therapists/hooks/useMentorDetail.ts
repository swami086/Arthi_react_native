import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../api/supabase';
import { Profile } from '../../../api/types';

interface TherapistReview {
    id: string;
    mentee_id: string;
    mentor_id: string;
    rating: number;
    comment: string;
    created_at: string;
    mentee: {
        full_name: string;
        avatar_url?: string;
    };
}

interface UseTherapistDetailReturn {
    mentor: Profile | null;
    reviews: TherapistReview[];
    availability: any[]; // refine type based on db
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useTherapistDetail = (mentorId: string): UseTherapistDetailReturn => {
    const [mentor, setTherapist] = useState<Profile | null>(null);
    const [reviews, setReviews] = useState<TherapistReview[]>([]);
    const [availability, setAvailability] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!mentorId) return;
        setLoading(true);
        setError(null);

        try {
            // Fetch Therapist Profile
            const { data: mentorData, error: mentorError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', mentorId)
                .single();

            if (mentorError) throw mentorError;
            setTherapist(mentorData);

            // Fetch Reviews
            // Assuming we have a join relation or we just fetch raw and fetch user names
            // For now, let's try to fetch reviews. If table doesn't have relation setup fully in API, this might fail,
            // so we'll catch and ignore or use dummy if empty.
            // Using a simple query for now.
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select(`
                    id,
                    mentee_id,
                    mentor_id,
                    rating,
                    comment,
                    created_at
                `)
                .eq('mentor_id', mentorId)
                .order('created_at', { ascending: false });

            // Note: To get mentee name, we would need to join profiles.
            // .select('*, mentee:profiles!mentee_id(full_name, avatar_url)')
            // This depends on FK name.

            if (!reviewsError && reviewsData) {
                // Mocking the mentee join for now if strictly necessary or assuming FE handles it.
                // We'll stick to available data.
                const formattedReviews = reviewsData.map((r: any) => ({
                    ...r,
                    mentee: { full_name: 'Anonymous', avatar_url: null } // Placeholder until join works
                }));
                setReviews(formattedReviews);
            }

            // Fetch Availability
            const { data: availData, error: availError } = await supabase
                .from('mentor_availability')
                .select('*')
                .eq('mentor_id', mentorId);

            if (!availError && availData) {
                setAvailability(availData);
            }

        } catch (err: any) {
            console.error('Error fetching mentor details:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [mentorId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return { mentor, reviews, availability, loading, error, refetch: fetchDetail };
};
