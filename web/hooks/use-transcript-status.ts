'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Transcript } from '@/types/database';
import { reportError } from '@/lib/rollbar-utils';

export function useTranscriptStatus(recordingId: string) {
    const [transcript, setTranscript] = useState<Transcript | null>(null);
    const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!recordingId) return;

        const supabase = createClient();

        // Initial fetch
        const fetchTranscript = async () => {
            try {
                // Check if transcript exists
                const { data, error } = await supabase
                    .from('transcripts')
                    .select('*')
                    .eq('recording_id', recordingId)
                    .single();

                if (data) {
                    setTranscript(data);
                    setStatus('completed');
                } else if (error && error.code !== 'PGRST116') {
                    // Ignore not found error
                    throw error;
                } else {
                    // Check recording status if transcript doesn't exist
                    const { data: recording } = await supabase
                        .from('session_recordings')
                        .select('recording_status')
                        .eq('id', recordingId)
                        .single();

                    // Cast recording_status to unknown then string to inspect, or handle generic
                    const recStatus = (recording as any)?.recording_status as string;

                    if (recStatus === 'failed') {
                        setStatus('failed');
                        setError('Recording processing failed');
                    } else {
                        setStatus('processing');
                    }
                }
            } catch (err: any) {
                console.error('Error fetching transcript:', err);
                reportError(err, 'useTranscriptStatus - fetch');
                setError(err.message);
                setStatus('failed');
            }
        };

        fetchTranscript();

        // Realtime subscription
        const channel = supabase
            .channel(`transcript-${recordingId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transcripts',
                    filter: `recording_id=eq.${recordingId}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        setTranscript(payload.new as Transcript);
                        setStatus('completed');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [recordingId]);

    return { transcript, status, error };
}
