import { useEffect, useState } from 'react';
import { supabase } from '../../../api/supabase';
import { Appointment } from '../../../api/types';
import { useAuth } from '../../auth/hooks/useAuth';

export const useAppointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchAppointments = async () => {
            try {
                const { data, error: apiError } = await supabase
                    .from('appointments')
                    .select('*')
                    .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
                    .order('start_time', { ascending: true });

                if (apiError) throw apiError;
                if (data) setAppointments(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch appointments');
            } finally {
                setLoading(false);
            }
        };

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
    }, [user]);

    return { appointments, loading, error };
};
