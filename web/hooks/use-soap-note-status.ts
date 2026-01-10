'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SoapNote } from '@/types/soap-note';
import { reportError } from '@/lib/rollbar-utils';

export function useSoapNoteStatus(appointmentId: string) {
    const [soapNote, setSoapNote] = useState<SoapNote | null>(null);
    const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'failed'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!appointmentId) return;

        const supabase = createClient();

        const fetchSoapNote = async () => {
            try {
                const { data, error } = await supabase
                    .from('soap_notes')
                    .select('*')
                    .eq('appointment_id', appointmentId)
                    .single();

                if (data) {
                    setSoapNote(data as unknown as SoapNote);
                    setStatus('ready');
                } else if (error && error.code !== 'PGRST116') {
                    throw error;
                }
            } catch (err: any) {
                console.error('Error fetching soap note:', err);
                reportError(err, 'useSoapNoteStatus - fetch');
                setError(err.message);
            }
        };

        fetchSoapNote();

        const channel = supabase
            .channel(`soap-${appointmentId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'soap_notes',
                    filter: `appointment_id=eq.${appointmentId}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        setSoapNote(payload.new as unknown as SoapNote);
                        setStatus('ready');
                        setIsSaving(false);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [appointmentId]);

    return { soapNote, status, setStatus, error, isSaving, setIsSaving, setSoapNote };
}
