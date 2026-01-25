import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface AppointmentWithPatient {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  patient?: { full_name?: string; avatar_url?: string };
}

export function useAppointmentsForPatient(patientId: string | null) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    if (!user || !patientId) {
      setAppointments([]);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('practice_id')
        .eq('user_id', user.id)
        .single();

      let query = (supabase
        .from('appointments') as any)
        .select(`
          id,
          start_time,
          end_time,
          status,
          patient:profiles!patient_id(full_name, avatar_url)
        `)
        .eq('therapist_id', user.id)
        .eq('patient_id', patientId)
        .order('start_time', { ascending: false })
        .limit(20);

      if (profile?.practice_id) {
        query = query.eq('practice_id', profile.practice_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAppointments(data ?? []);
    } catch (e) {
      console.error('useAppointmentsForPatient:', e);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user, patientId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return { appointments, loading, refetch: fetchAppointments };
}
