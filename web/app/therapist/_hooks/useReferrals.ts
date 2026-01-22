'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getReferrals, respondToReferral } from '@/lib/services/relationship-service';
import { toast } from 'sonner';

export function useReferrals() {
    const supabase = createClient();
    const [received, setReceived] = useState<any[]>([]);
    const [sent, setSent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch practice context
        const { data: profile } = await supabase
            .from('profiles')
            .select('practice_id')
            .eq('user_id', user.id)
            .single();
        const practiceId = profile?.practice_id;

        const [rData, sData] = await Promise.all([
            getReferrals(supabase, user.id, 'therapist', practiceId), // received
            getReferrals(supabase, user.id, 'referrer', practiceId) // sent
        ]);

        setReceived(rData || []);
        setSent(sData || []);
        setLoading(false);
    }, [supabase]);

    const handleResponse = async (referralId: string, status: 'accepted' | 'declined') => {
        const success = await respondToReferral(supabase, referralId, status);
        if (success) {
            toast.success(`Referral ${status}`);
            fetchData(); // Refetch
        } else {
            toast.error('Failed to update referral');
        }
    };

    useEffect(() => {
        fetchData();
        // Subscribe if needed
    }, [fetchData]);

    return { received, sent, loading, handleResponse, refetch: fetchData };
}
