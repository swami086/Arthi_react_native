import { useEffect, useState } from 'react';
import { supabase } from '../../../api/supabase';
import { Profile } from '../../../api/types';

export const useMentors = () => {
    const [mentors, setMentors] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMentors = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'mentor');

        if (error) setError(error.message);
        if (data) setMentors(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchMentors();
    }, []);

    return { mentors, loading, error, refetch: fetchMentors };
};
