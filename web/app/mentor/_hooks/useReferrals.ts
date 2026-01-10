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

        const [rData, sData] = await Promise.all([
            getReferrals(supabase, user.id, 'mentor'), // received
            getReferrals(supabase, user.id, 'referrer') // sent
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
