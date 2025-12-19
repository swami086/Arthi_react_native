import { useState, useCallback, useRef } from 'react';
import * as audioRecordingService from '../../../services/audioRecordingService';

export const useRecording = () => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Use ref to persist interval ID across renders
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const hasPermission = await audioRecordingService.requestAudioPermissions();
      if (!hasPermission) {
        setError('Microphone permission denied');
        return false;
      }

      const success = await audioRecordingService.startRecording();
      if (success) {
        setRecordingState('recording');
        setDuration(0);
        setError(null);

        // Clear any existing interval just in case
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }

        // Update duration every second
        durationIntervalRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);

        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    }
  }, []);

  const pauseRecording = useCallback(async () => {
    try {
      const success = await audioRecordingService.pauseRecording();
      if (success) {
        setRecordingState('paused');
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    }
  }, []);

  const resumeRecording = useCallback(async () => {
    try {
      const success = await audioRecordingService.resumeRecording();
      if (success) {
        setRecordingState('recording');

        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }

        durationIntervalRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);

        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      const result = await audioRecordingService.stopRecording();
      setRecordingState('idle');
      // Duration is returned by stopRecording, but we might want to keep the display value
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    }
  }, []);

  return {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    recordingState,
    duration,
    setDuration, // Allow external update if needed
    error,
  };
};
