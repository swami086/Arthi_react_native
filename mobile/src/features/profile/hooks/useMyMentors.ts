import { useState, useEffect } from 'react';
import { getRelationshipsByPatient } from '../../../api/relationshipService';
import { useAuth } from '../../auth/hooks/useAuth';

export const useMyTherapists = () => {
    const { user } = useAuth();
    const [mentors, setTherapists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTherapists = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const relationships = await getRelationshipsByPatient(user.id);
            // Relationship returns { ..., mentor: policies }
            // Mapped to flat structure if needed or keep as is.
            // Screen expects: { id, name, role, avatar }
            const formatted = relationships.map((r: any) => ({
                id: r.mentor.user_id,
                name: r.mentor.full_name,
                role: r.mentor.specialization || 'Therapist',
                avatar: r.mentor.avatar_url,
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

    return { mentors, loading, error, refetch: fetchTherapists };
};
