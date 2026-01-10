'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getTherapists } from '@/lib/services/therapist-service';
import { Database } from '@/types/database';
import { reportError } from '@/lib/rollbar-utils';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useTherapists() {
    const [therapists, setTherapists] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchTherapists = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const data = await getTherapists(supabase);
            setTherapists(data);
        } catch (err: any) {
            setError(err);
            reportError(err, 'useTherapists.fetch');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTherapists();
    }, [fetchTherapists]);

    return { therapists, loading, error, refetch: fetchTherapists };
}
