import { reportError } from '@/lib/rollbar-utils';
import { RecordingState } from '@/types/recording';

export class AudioRecordingService {
    private mediaRecorder: MediaRecorder | null = null;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private stream: MediaStream | null = null;
    private chunks: Blob[] = [];
    private startTime: number = 0;
    private pausedDuration: number = 0;
    private pauseStartTime: number = 0;

    async requestMicrophonePermission(): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            reportError(error, 'requestMicrophonePermission');
            return false;
        }
    }

    async startRecording(): Promise<boolean> {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Set up audio analysis for waveform
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.audioContext = new AudioContextClass();
            const source = this.audioContext.createMediaStreamSource(this.stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            source.connect(this.analyser);

            // Set up recorder
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.chunks.push(e.data);
                }
            };

            this.chunks = [];
            this.mediaRecorder.start(1000); // Collect chunks every second
            this.startTime = Date.now();
            this.pausedDuration = 0;

            return true;
        } catch (error) {
            reportError(error, 'startRecording');
            this.cleanupRecording();
            return false;
        }
    }

    pauseRecording(): boolean {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
            this.pauseStartTime = Date.now();
            if (this.audioContext) {
                this.audioContext.suspend();
            }
            return true;
        }
        return false;
    }

    resumeRecording(): boolean {
        if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
            this.pausedDuration += Date.now() - this.pauseStartTime;
            if (this.audioContext) {
                this.audioContext.resume();
            }
            return true;
        }
        return false;
    }

    async stopRecording(): Promise<{ blob: Blob; duration: number } | null> {
        return new Promise((resolve) => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                resolve(null);
                return;
            }

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.chunks, { type: 'audio/webm' });
                const totalDuration = Date.now() - this.startTime - this.pausedDuration;
                resolve({ blob, duration: totalDuration });
            };

            this.mediaRecorder.stop();
            this.cleanupRecording();
        });
    }

    getRecordingStatus(): { state: RecordingState; duration: number; audioLevel: number } {
        const state = (this.mediaRecorder?.state as RecordingState) || 'idle';
        let duration = 0;
        let audioLevel = 0;

        if (state !== 'idle') {
            const now = Date.now();
            if (state === 'paused') {
                duration = this.pauseStartTime - this.startTime - this.pausedDuration;
            } else {
                duration = now - this.startTime - this.pausedDuration;
            }

            if (this.analyser && state === 'recording') {
                const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
                this.analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
                audioLevel = average;
            }
        }

        return { state, duration, audioLevel };
    }

    cleanupRecording() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.analyser = null;
        this.mediaRecorder = null;
    }
}

export const audioRecordingService = new AudioRecordingService();
