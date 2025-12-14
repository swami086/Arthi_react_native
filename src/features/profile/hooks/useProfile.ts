import { useEffect, useState } from 'react';
import { supabase } from '../../../api/supabase';
import { Profile } from '../../../api/types';
import { useAuth } from '../../auth/hooks/useAuth';

export const useProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('user_id', user.id);

            if (error) throw error;
            await fetchProfile(); // Refresh
        } catch (err: any) {
            throw err;
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);

    return { profile, loading, error, updateProfile, refetch: fetchProfile };
};
