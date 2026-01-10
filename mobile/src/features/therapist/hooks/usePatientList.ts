import { useEffect, useState, useCallback } from 'react';
import { getPatientList } from '../../../api/therapistService';
import { PatientWithActivity } from '../../../api/types';
import { useAuth } from '../../auth/hooks/useAuth';
import { supabase } from '../../../api/supabase';

export const usePatientList = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState<PatientWithActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPatients = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await getPatientList(user.id);
            // Deduplicate by patient_id to prevent UI errors
            const uniquePatients = Array.from(new Map(data.map(item => [item.patient_id, item])).values());
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
            .channel('patient_list_updates')
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
        patients, loading, error, refetch: fetchPatients, removePatient: async (patientId: string) => {
            if (!user) return;
            try {
                await import('../../../api/therapistService').then(m => m.deactivatePatientRelationship(user.id, patientId));
                // Optimistic update or refetch
                fetchPatients();
            } catch (e) {
                console.error(e);
                throw e;
            }
        }
    };
};
