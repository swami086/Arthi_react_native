// ... imports
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../api/supabase';
import { Appointment } from '../../../api/types';
import { useAuth } from '../../auth/hooks/useAuth';

import { Profile } from '../../../api/types';
import { reportError, withRollbarTrace, startSpan, endSpan, startTimer, endTimer } from '../../../services/rollbar';

export type AppointmentWithDetails = Appointment & {
    therapist?: Pick<Profile, 'full_name' | 'avatar_url'>;
    patient?: Pick<Profile, 'full_name' | 'avatar_url'>;
};

export const useAppointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointments = useCallback(async () => {
        if (!user) return;
        startSpan('api.appointments.fetch');
        startTimer('appointments_load');
        try {
            setLoading(true);
            const { data, error: apiError } = await supabase
                .from('appointments')
                .select(`
                    *,
                    therapist:profiles!therapist_id(full_name, avatar_url),
                    patient:profiles!patient_id(full_name, avatar_url)
                `)
                .or(`therapist_id.eq.${user.id},patient_id.eq.${user.id},session_type.eq.public`)
                // @ts-ignore
                .order('start_time', { ascending: true });

            if (apiError) throw apiError;
            if (data) {
                // Deduplicate appointments by ID to prevent UI key errors
                const uniqueAppointments = Array.from(new Map(data.map(item => [item.id, item])).values());
                setAppointments(uniqueAppointments as AppointmentWithDetails[]);
            }
            endTimer('appointments_load', 'useAppointments:fetchAppointments', { count: data?.length || 0 });
            setError(null);
        } catch (err: any) {
            reportError(err, 'useAppointments:fetchAppointments');
            setError(err.message || 'Failed to fetch appointments');
        } finally {
            setLoading(false);
            endSpan();
        }
    }, [user]);

    useEffect(() => {
        fetchAppointments();

        const channel = supabase
            .channel('appointments')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'appointments',
            }, () => {
                fetchAppointments();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchAppointments]);

    return { appointments, loading, error, refetch: fetchAppointments };
};
