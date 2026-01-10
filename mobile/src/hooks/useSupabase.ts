import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export const useSupabase = () => {
    return { supabase };
};

export const useQuery = <T>(
    queryFn: () => Promise<{ data: T | null; error: PostgrestError | null } | { data: T | null; error: any }>,
    deps: any[] = []
) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await queryFn();
            if (error) throw error;
            setData(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

export const useSubscription = (
    channelName: string,
    event: { event: '*' | 'INSERT' | 'UPDATE' | 'DELETE'; schema?: string; table: string; filter?: string },
    callback: (payload: any) => void,
    deps: any[] = []
) => {
    useEffect(() => {
        const channel = supabase
            .channel(channelName)
            .on('postgres_changes', event as any, callback)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};
