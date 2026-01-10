'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getMentorById, getMentorReviews, getMentorAvailability } from '@/lib/services/mentor-service';
import { Database } from '@/types/database';
import { reportError } from '@/lib/rollbar-utils';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useMentorDetail(mentorId: string) {
    const [mentor, setMentor] = useState<Profile | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [availability, setAvailability] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!mentorId) return;

        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const [mentorData, reviewsData, availabilityData] = await Promise.all([
                getMentorById(supabase, mentorId),
                getMentorReviews(supabase, mentorId),
                getMentorAvailability(supabase, mentorId)
            ]);

            setMentor(mentorData);
            setReviews(reviewsData);
            setAvailability(availabilityData);
        } catch (err: any) {
            setError(err);
            reportError(err, 'useMentorDetail.fetch', { mentorId });
        } finally {
            setLoading(false);
        }
    }, [mentorId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return { mentor, reviews, availability, loading, error, refetch: fetchDetail };
}
