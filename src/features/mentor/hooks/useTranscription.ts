import { useState, useCallback } from 'react';
import { supabase } from '../../../api/supabase';

export const useTranscription = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const triggerTranscription = useCallback(async (recordingId: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      const { data, error: funcError } = await supabase.functions.invoke('transcribe-audio', {
        body: { recording_id: recordingId }
      });

      if (funcError) {
        console.error('[useTranscription] Function invocation error:', funcError);
        throw new Error(funcError.message);
      }

      if (data?.error) {
        console.error('[useTranscription] Function returned error:', data.error);
        throw new Error(data.error);
      }

      setTranscript(data.transcript?.transcript_text || '');
      setIsProcessing(false);

      return data.transcript;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useTranscription] Caught error:', message);
      setError(message);
      setIsProcessing(false);
      return null;
    }
  }, []);

  return {
    triggerTranscription,
    transcript,
    isProcessing,
    error,
  };
};
