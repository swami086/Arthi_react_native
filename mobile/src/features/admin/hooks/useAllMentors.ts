import { useState, useEffect } from 'react';
import { getAllMentors } from '../../../api/adminService';
import { Profile } from '../../../api/types';

export const useAllMentors = () => {
    const [mentors, setMentors] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMentors = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllMentors();
            setMentors(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to fetch mentors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMentors();
    }, []);

    return { mentors, loading, error, fetchMentors };
};
