import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../api/supabase';
import { Profile } from '../../../api/types';

interface TherapistReview {
    id: string;
    patient_id: string;
    therapist_id: string;
    rating: number;
    comment: string;
    created_at: string;
    patient: {
        full_name: string;
        avatar_url?: string;
    };
}

interface UseTherapistDetailReturn {
    therapist: Profile | null;
    reviews: TherapistReview[];
    availability: any[]; // refine type based on db
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useTherapistDetail = (therapistId: string): UseTherapistDetailReturn => {
    const [therapist, setTherapist] = useState<Profile | null>(null);
    const [reviews, setReviews] = useState<TherapistReview[]>([]);
    const [availability, setAvailability] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!therapistId) return;
        setLoading(true);
        setError(null);

        try {
            // Fetch Therapist Profile
            const { data: therapistData, error: therapistError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', therapistId)
                .single();

            if (therapistError) throw therapistError;
            setTherapist(therapistData);

            // Fetch Reviews
            // Assuming we have a join relation or we just fetch raw and fetch user names
            // For now, let's try to fetch reviews. If table doesn't have relation setup fully in API, this might fail,
            // so we'll catch and ignore or use dummy if empty.
            // Using a simple query for now.
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select(`
                    id,
                    patient_id,
                    therapist_id,
                    rating,
                    comment,
                    created_at
                `)
                .eq('therapist_id', therapistId)
                .order('created_at', { ascending: false });

            // Note: To get patient name, we would need to join profiles.
            // .select('*, patient:profiles!patient_id(full_name, avatar_url)')
            // This depends on FK name.

            if (!reviewsError && reviewsData) {
                // Mocking the patient join for now if strictly necessary or assuming FE handles it.
                // We'll stick to available data.
                const formattedReviews = reviewsData.map((r: any) => ({
                    ...r,
                    patient: { full_name: 'Anonymous', avatar_url: null } // Placeholder until join works
                }));
                setReviews(formattedReviews);
            }

            // Fetch Availability
            const { data: availData, error: availError } = await supabase
                .from('therapist_availability')
                .select('*')
                .eq('therapist_id', therapistId);

            if (!availError && availData) {
                setAvailability(availData);
            }

        } catch (err: any) {
            console.error('Error fetching therapist details:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [therapistId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return { therapist, reviews, availability, loading, error, refetch: fetchDetail };
};
