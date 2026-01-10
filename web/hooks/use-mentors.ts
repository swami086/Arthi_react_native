'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getMentors } from '@/lib/services/mentor-service';
import { Database } from '@/types/database';
import { reportError } from '@/lib/rollbar-utils';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useMentors() {
    const [mentors, setMentors] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchMentors = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const data = await getMentors(supabase);
            setMentors(data);
        } catch (err: any) {
            setError(err);
            reportError(err, 'useMentors.fetch');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMentors();
    }, [fetchMentors]);

    return { mentors, loading, error, refetch: fetchMentors };
}
