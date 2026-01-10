import { useState, useRef, useCallback, useEffect } from 'react';
import { audioRecordingService } from '@/lib/services/audio-recording-service';
import { RecordingState } from '@/types/recording';
import { reportError } from '@/lib/rollbar-utils';

export function useRecording() {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [duration, setDuration] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const updateStatus = useCallback(() => {
        const status = audioRecordingService.getRecordingStatus();
        setDuration(Math.floor(status.duration / 1000));
        setAudioLevel(status.audioLevel);
    }, []);

    const startRecording = useCallback(async () => {
        setError(null);
        try {
            const hasPermission = await audioRecordingService.requestMicrophonePermission();
            if (!hasPermission) {
                setError('Microphone permission denied');
                return false;
            }

            const started = await audioRecordingService.startRecording();
            if (started) {
                setRecordingState('recording');
                // Start timer loop
                timerRef.current = setInterval(updateStatus, 100); // 100ms for smooth waveform
                return true;
            } else {
                setError('Failed to start recording');
                return false;
            }
        } catch (err) {
            reportError(err, 'useRecording.startRecording');
            setError('An error occurred');
            return false;
        }
    }, [updateStatus]);

    const pauseRecording = useCallback(() => {
        const paused = audioRecordingService.pauseRecording();
        if (paused) {
            setRecordingState('paused');
        }
    }, []);

    const resumeRecording = useCallback(() => {
        const resumed = audioRecordingService.resumeRecording();
        if (resumed) {
            setRecordingState('recording');
        }
    }, []);

    const stopRecording = useCallback(async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        try {
            const result = await audioRecordingService.stopRecording();
            setRecordingState('idle');
            setDuration(0);
            setAudioLevel(0);
            return result;
        } catch (err) {
            reportError(err, 'useRecording.stopRecording');
            setError('Failed to stop recording');
            return null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            // Ensure recording is stopped if component unmounts
            audioRecordingService.cleanupRecording();
        };
    }, []);

    return {
        recordingState,
        duration,
        audioLevel,
        error,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording
    };
}
