import { useState, useEffect } from 'react';
import { getAllMentees } from '../../../api/adminService';
import { Profile } from '../../../api/types';

export const useAllMentees = () => {
    const [mentees, setMentees] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMentees = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllMentees();
            setMentees(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch mentees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMentees();
    }, []);

    return { mentees, loading, error, fetchMentees };
};
