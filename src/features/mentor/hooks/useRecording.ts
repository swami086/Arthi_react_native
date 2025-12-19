import { useState, useCallback } from 'react';
import * as audioRecordingService from '../../../services/audioRecordingService';

export const useRecording = () => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [metering, setMetering] = useState(-160);
  let durationInterval: NodeJS.Timeout | null = null;

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
        setMetering(-160);

        // Update duration every second (and metering if possible)
        durationInterval = setInterval(async () => {
          setDuration(prev => prev + 1);
          const status = await audioRecordingService.getRecordingStatus();
          if (status) {
             setMetering(status.metering);
          }
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
        if (durationInterval) clearInterval(durationInterval);
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
        durationInterval = setInterval(async () => {
          setDuration(prev => prev + 1);
           const status = await audioRecordingService.getRecordingStatus();
          if (status) {
             setMetering(status.metering);
          }
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
      if (durationInterval) clearInterval(durationInterval);
      const result = await audioRecordingService.stopRecording();
      setRecordingState('idle');
      setDuration(0);
      setMetering(-160);
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
    metering,
    error,
  };
};
