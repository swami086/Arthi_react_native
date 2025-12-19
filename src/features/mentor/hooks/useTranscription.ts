import { useState, useCallback } from 'react';

export const useTranscription = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const triggerTranscription = useCallback(async (recordingId: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      // PLACEHOLDER: Simulate transcription processing
      console.log('PLACEHOLDER: Transcription would be triggered for recording:', recordingId);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockTranscript = 'This is a placeholder transcript. After Supabase configuration, this will contain the actual transcribed text from the audio recording.';
      setTranscript(mockTranscript);
      setIsProcessing(false);

      return mockTranscript;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
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
