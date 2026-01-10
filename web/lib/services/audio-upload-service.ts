import { createClient } from '@/lib/supabase/client';
import { reportError } from '@/lib/rollbar-utils';
import { RecordingUploadResult } from '@/types/recording';

export class AudioUploadService {
    async uploadAudioToSupabase(
        blob: Blob,
        appointmentId: string,
        mentorId: string,
        menteeId: string,
        onProgress?: (progress: number) => void
    ): Promise<RecordingUploadResult | null> {
        try {
            const supabase = createClient();

            // Validate file size (max 25MB for Whisper)
            const MAX_SIZE = 25 * 1024 * 1024;
            if (blob.size > MAX_SIZE) {
                throw new Error('File size exceeds 25MB limit');
            }

            // 1. Create DB entry first
            const { data: recordingResult, error: dbError } = await (supabase
                .from('session_recordings') as any)
                .insert({
                    appointment_id: appointmentId,
                    mentor_id: mentorId,
                    mentee_id: menteeId,
                    recording_url: '', // Will update after upload
                    recording_status: 'processing',
                    consent_captured: true,
                    file_size_bytes: blob.size,
                    duration_seconds: null // Will update if verified
                } as any)
                .select()
                .single();

            const recording = recordingResult as any;

            if (dbError || !recording) {
                throw dbError || new Error('Failed to create recording record');
            }

            // 2. Upload file
            const fileName = `${mentorId}/${recording.id}.webm`;
            const { error: uploadError } = await supabase.storage
                .from('session-recordings')
                .upload(fileName, blob, {
                    contentType: 'audio/webm',
                    upsert: true
                });

            if (uploadError) {
                // Determine if we should delete the DB record or mark as failed
                await (supabase
                    .from('session_recordings') as any)
                    .update({ recording_status: 'failed' } as any)
                    .eq('id', recording.id);
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('session-recordings')
                .getPublicUrl(fileName);

            // 3. Update DB with path (for signed URL generation)
            const { error: updateError } = await (supabase
                .from('session_recordings') as any)
                .update({
                    recording_url: fileName,
                    recording_status: 'completed'
                } as any)
                .eq('id', recording.id);

            if (updateError) throw updateError;

            if (onProgress) onProgress(100);

            return {
                recordingId: recording.id,
                recordingUrl: publicUrl
            };

        } catch (error) {
            reportError(error, 'uploadAudioToSupabase', { appointmentId, mentorId });
            return null;
        }
    }

    async deleteRecordingFromStorage(recordingUrl: string): Promise<boolean> {
        try {
            const supabase = createClient();

            // Extract path from URL
            // URL format: .../session-recordings/mentorId/recordingId.webm
            const path = recordingUrl.split('/session-recordings/').pop();

            if (!path) return false;

            const { error } = await supabase.storage
                .from('session-recordings')
                .remove([path]);

            if (error) throw error;
            return true;
        } catch (error) {
            reportError(error, 'deleteRecordingFromStorage', { recordingUrl });
            return false;
        }
    }
}

export const audioUploadService = new AudioUploadService();
