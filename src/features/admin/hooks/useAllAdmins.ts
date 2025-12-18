import { useState, useEffect } from 'react';
import { getAllAdmins } from '../../../api/adminService';
import { Profile } from '../../../api/types';

export const useAllAdmins = () => {
    const [admins, setAdmins] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAdmins = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllAdmins();
            setAdmins(data);
        } catch (error: any) {
            setError(error.message || 'Failed to fetch admins');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    return { admins, loading, error, fetchAdmins };
};
