import { useState, useEffect } from 'react';
import { getRelationshipsByPatient } from '../../../api/relationshipService';
import { useAuth } from '../../auth/hooks/useAuth';

export const useMyTherapists = () => {
    const { user } = useAuth();
    const [therapists, setTherapists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTherapists = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const relationships = await getRelationshipsByPatient(user.id);
            // Relationship returns { ..., therapist: policies }
            // Mapped to flat structure if needed or keep as is.
            // Screen expects: { id, name, role, avatar }
            const formatted = relationships.map((r: any) => ({
                id: r.therapist.user_id,
                name: r.therapist.full_name,
                role: r.therapist.specialization || 'Therapist',
                avatar: r.therapist.avatar_url,
                relationshipId: r.id
            }));
            setTherapists(formatted);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTherapists();
    }, [user]);

    return { therapists, loading, error, refetch: fetchTherapists };
};
