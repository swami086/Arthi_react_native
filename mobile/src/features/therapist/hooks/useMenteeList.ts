import { useEffect, useState, useCallback } from 'react';
import { getPatientList } from '../../../api/mentorService';
import { PatientWithActivity } from '../../../api/types';
import { useAuth } from '../../auth/hooks/useAuth';
import { supabase } from '../../../api/supabase';

export const usePatientList = () => {
    const { user } = useAuth();
    const [mentees, setPatients] = useState<PatientWithActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPatients = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await getPatientList(user.id);
            // Deduplicate by mentee_id to prevent UI errors
            const uniquePatients = Array.from(new Map(data.map(item => [item.mentee_id, item])).values());
            setPatients(uniquePatients);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPatients();

        const subscription = supabase
            .channel('mentee_list_updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'appointments' },
                () => fetchPatients()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'messages' },
                () => fetchPatients()
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchPatients]);

    return {
        mentees, loading, error, refetch: fetchPatients, removePatient: async (menteeId: string) => {
            if (!user) return;
            try {
                await import('../../../api/mentorService').then(m => m.deactivatePatientRelationship(user.id, menteeId));
                // Optimistic update or refetch
                fetchPatients();
            } catch (e) {
                console.error(e);
                throw e;
            }
        }
    };
};
