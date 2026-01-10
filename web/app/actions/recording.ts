'use server';

import { createClient } from '@/lib/supabase/server';
import { reportError } from '@/lib/rollbar-utils';

export async function initiateRecording(appointmentId: string) {
    const supabase = await createClient();
    try {
        // Verify user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: 'Unauthorized', status: 401 };
        }

        // Get appointment
        const { data: appointmentResult, error: appError } = await (supabase
            .from('appointments') as any)
            .select('*')
            .eq('id', appointmentId)
            .single();

        const appointment = appointmentResult as any;

        if (appError || !appointment) {
            return { error: 'Appointment not found', status: 404 };
        }

        // Verify mentor ownership
        if (appointment.mentor_id !== user.id) {
            return { error: 'Not authorized for this session', status: 403 };
        }

        return {
            success: true,
            appointment
        };
    } catch (error) {
        reportError(error, 'initiateRecording', { appointmentId });
        return { error: 'Server error', status: 500 };
    }
}

export async function triggerTranscription(recordingId: string) {
    const supabase = await createClient();
    try {
        const { data: { session } } = await supabase.auth.getSession();

        // Invoke Edge Function
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
            body: { recording_id: recordingId },
            headers: {
                Authorization: `Bearer ${session?.access_token}`
            }
        });

        if (error) {
            throw error;
        }

        return { success: true, data };
    } catch (error) {
        reportError(error, 'triggerTranscription', { recordingId });
        return { success: false, error: (error as Error).message };
    }
}

export async function getRecordingStatus(recordingId: string) {
    const supabase = await createClient();
    try {
        const { data: recordingResult, error } = await (supabase
            .from('session_recordings') as any)
            .select(`
                *,
                transcripts (*)
            `)
            .eq('id', recordingId)
            .single();

        const recording = recordingResult as any;

        if (error) throw error;

        return { success: true, recording };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteRecording(recordingId: string) {
    const supabase = await createClient();
    try {
        const { error } = await (supabase
            .from('session_recordings') as any)
            .delete()
            .eq('id', recordingId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        reportError(error, 'deleteRecording', { recordingId });
        return { success: false, error: (error as Error).message };
    }
}
