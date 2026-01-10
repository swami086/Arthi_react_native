
export type RecordingState = 'idle' | 'recording' | 'paused';

export interface RecordingStatus {
    isRecording: boolean;
    duration: number;
    audioLevel: number;
}

export interface RecordingResult {
    blob: Blob;
    duration: number;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface RecordingUploadResult {
    recordingId: string;
    recordingUrl: string;
}
