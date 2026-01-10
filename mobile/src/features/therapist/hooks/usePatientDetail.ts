import { useEffect, useState, useCallback } from 'react';
import { getPatientProfile } from '../../../api/therapistService';
import { Profile, PatientGoal, TherapistNote } from '../../../api/types';
import { supabase } from '../../../api/supabase';

export const usePatientDetail = (patientId: string) => {
    const [patient, setPatient] = useState<Profile | null>(null);
    const [goals, setGoals] = useState<PatientGoal[]>([]);
    const [notes, setNotes] = useState<TherapistNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getPatientProfile(patientId);
            if (data) {
                setPatient(data.profile);
                setGoals(data.goals);
                setNotes(data.notes);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchDetail();

        const sub = supabase.channel(`patient_detail_${patientId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'therapist_notes', filter: `patient_id=eq.${patientId}` }, fetchDetail)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_goals', filter: `patient_id=eq.${patientId}` }, fetchDetail)
            .subscribe();

        return () => { sub.unsubscribe(); };

    }, [fetchDetail, patientId]);

    return { patient, goals, notes, loading, error, refetch: fetchDetail };
};
