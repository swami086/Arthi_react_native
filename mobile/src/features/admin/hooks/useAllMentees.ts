import { useState, useEffect } from 'react';
import { getAllPatients } from '../../../api/adminService';
import { Profile } from '../../../api/types';

export const useAllPatients = () => {
    const [mentees, setPatients] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPatients = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllPatients();
            setPatients(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch mentees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    return { mentees, loading, error, fetchPatients };
};
