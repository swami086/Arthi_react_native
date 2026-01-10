import { useState, useEffect } from 'react';
import { getAllTherapists } from '../../../api/adminService';
import { Profile } from '../../../api/types';

export const useAllTherapists = () => {
    const [therapists, setTherapists] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTherapists = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllTherapists();
            setTherapists(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to fetch therapists");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTherapists();
    }, []);

    return { therapists, loading, error, fetchTherapists };
};
