import { useEffect, useState } from 'react';
import { supabase } from '../../../api/supabase';
import { Profile } from '../../../api/types';

export const useTherapists = () => {
    const [mentors, setTherapists] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTherapists = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'mentor');

        if (error) setError(error.message);
        if (data) setTherapists(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchTherapists();
    }, []);

    return { mentors, loading, error, refetch: fetchTherapists };
};
