'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export function usePracticeContext() {
    const [practiceId, setPracticeId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchPractice() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setLoading(false);
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('practice_id')
                    .eq('user_id', user.id)
                    .single();

                setPracticeId(profile?.practice_id || null);
            } catch (error) {
                console.error('Error fetching practice context:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPractice();
    }, []);

    return { practiceId, loading };
}
