
import { createClient } from '@/lib/supabase/client';
import { useState, useCallback, useEffect } from 'react';
import { reportError } from '@/lib/rollbar-utils';
import { toast } from 'sonner';

export interface Patient {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
    status: 'active' | 'pending' | 'completed';
    created_at: string;
    // Add other fields from RPC/query
}

export function usePatientList() {
    const supabase = createClient();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPatients = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Using relationship table or RPC
            const { data, error } = await (supabase
                .from('therapist_patient_relationships') as any)
                .select(`
                    id,
                    status,
                    created_at,
                    patient:patient_id(id, full_name, avatar_url, email)
                `)
                .eq('therapist_id', user.id)
                .eq('status', 'active'); // Filtering for active list

            if (error) throw error;

            // Transform data
            const formatted: Patient[] = data.map((item: any) => ({
                id: item.patient.id,
                full_name: item.patient.full_name,
                avatar_url: item.patient.avatar_url,
                email: item.patient.email,
                status: item.status,
                created_at: item.created_at
            }));

            setPatients(formatted);

        } catch (err: any) {
            console.error('Error fetching patients:', err);
            setError(err.message);
            reportError(err, 'usePatientList');
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const removePatient = async (patientId: string) => {
        try {
            // Optimistic update
            setPatients(prev => prev.filter(m => m.id !== patientId));

            // Call API/Server Action
            // Doing client-side delete for now as per simple plan, or usually invoke a server action
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await (supabase
                .from('therapist_patient_relationships') as any)
                .update({ status: 'inactive' } as any) // Soft delete
                .eq('therapist_id', user.id)
                .eq('patient_id', patientId);

            if (error) throw error;
            toast.success('Patient removed successfully');
        } catch (err: any) {
            toast.error('Failed to remove patient');
            reportError(err, 'removePatient');
            fetchPatients(); // Revert on error
        }
    };

    useEffect(() => {
        fetchPatients();
        // Subscribe to changes
        // Subscribe to changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchPatients();
        });

        // Realtime
        const channel = supabase.channel('patient-list-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'therapist_patient_relationships' }, () => {
                fetchPatients();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, [fetchPatients, supabase]);

    return { patients, loading, error, refetch: fetchPatients, removePatient };
}
