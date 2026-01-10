'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getTherapistById, getTherapistReviews, getTherapistAvailability } from '@/lib/services/therapist-service';
import { Database } from '@/types/database';
import { reportError } from '@/lib/rollbar-utils';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useTherapistDetail(therapistId: string) {
    const [therapist, setTherapist] = useState<Profile | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [availability, setAvailability] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!therapistId) return;

        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const [therapistData, reviewsData, availabilityData] = await Promise.all([
                getTherapistById(supabase, therapistId),
                getTherapistReviews(supabase, therapistId),
                getTherapistAvailability(supabase, therapistId)
            ]);

            setTherapist(therapistData);
            setReviews(reviewsData);
            setAvailability(availabilityData);
        } catch (err: any) {
            setError(err);
            reportError(err, 'useTherapistDetail.fetch', { therapistId });
        } finally {
            setLoading(false);
        }
    }, [therapistId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return { therapist, reviews, availability, loading, error, refetch: fetchDetail };
}
