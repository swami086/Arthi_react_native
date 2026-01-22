
import { createClient } from '@/lib/supabase/client';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { reportError } from '@/lib/rollbar-utils';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

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
    const { user, isLoading: authLoading } = useAuth();
    const supabase = useMemo(() => createClient(), []);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchingRef = useRef(false);

    const fetchPatients = useCallback(async () => {
        if (!user) {
            setPatients([]);
            setLoading(false);
            return;
        }

        // Prevent duplicate fetches
        if (fetchingRef.current) {
            return;
        }
        
        try {
            fetchingRef.current = true;
            setLoading(true);
            setError(null);

            // Fetch practice_id for the user
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('practice_id')
                .eq('user_id', user.id)
                .single();

            if (profileError) {
                throw profileError;
            }

            // Fetch relationships first
            let relationshipQuery = (supabase.from('therapist_patient_relationships') as any)
                .select('id, status, created_at, patient_id')
                .eq('therapist_id', user.id)
                .eq('status', 'active');

            if (profile?.practice_id) {
                relationshipQuery = relationshipQuery.eq('practice_id', profile.practice_id);
            }

            const { data: relationships, error: relationshipError } = await relationshipQuery;

            if (relationshipError) {
                throw relationshipError;
            }

            if (!relationships || relationships.length === 0) {
                setPatients([]);
                setLoading(false);
                return;
            }

            // Fetch patient profiles
            const patientIds = relationships.map((r: any) => r.patient_id);
            const { data: patientProfiles, error: profileQueryError } = await supabase
                .from('profiles')
                .select('user_id, full_name, avatar_url')
                .in('user_id', patientIds);

            if (profileQueryError) {
                throw profileQueryError;
            }

            // Create a map of patient profiles by user_id
            const profileMap = new Map((patientProfiles || []).map((p: any) => [p.user_id, p]));

            // Transform data
            const formatted: Patient[] = relationships
                .map((rel: any) => {
                    const profile = profileMap.get(rel.patient_id);
                    if (!profile) return null;
                    return {
                        id: profile.user_id,
                        full_name: profile.full_name,
                        avatar_url: profile.avatar_url,
                        status: rel.status,
                        created_at: rel.created_at
                    };
                })
                .filter((p: any) => p !== null);

            setPatients(formatted);

        } catch (err: any) {
            console.error('[usePatientList] Error fetching patients:', err);
            setError(err.message);
            reportError(err, 'usePatientList');
            setPatients([]);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [supabase, user]);

    const removePatient = async (patientId: string) => {
        if (!user) return;
        
        try {
            // Optimistic update
            setPatients(prev => prev.filter(m => m.id !== patientId));

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

    // Trigger fetch when user becomes available
    useEffect(() => {
        if (user && !authLoading) {
            fetchPatients();
        } else if (!authLoading && !user) {
            setPatients([]);
            setLoading(false);
        }
    }, [authLoading, user, fetchPatients]);

    useEffect(() => {
        if (!user) return;
        
        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchPatients();
        });

        // Realtime subscription
        const channel = supabase.channel('patient-list-updates')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'therapist_patient_relationships' 
            }, () => {
                fetchPatients();
            })
            .subscribe();

        return () => {
            subscription?.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, [supabase, user, fetchPatients]);

    return { patients, loading, error, refetch: fetchPatients, removePatient };
}
