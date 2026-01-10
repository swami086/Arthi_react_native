'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft, Info, FileText } from 'lucide-react';
import { useRecording } from '@/hooks/use-recording';
import { audioUploadService } from '@/lib/services/audio-upload-service';
import { triggerTranscription } from '@/app/actions/recording';
import { RecordingControls } from '@/components/mentor/recording-controls';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RecordingConsentModal } from '@/components/video/recording-consent-modal';
import { reportError, addBreadcrumb } from '@/lib/rollbar-utils';

interface RecordingClientProps {
    appointment: any;
    existingRecording?: any;
    user: any;
}

export default function RecordingClient({ appointment, existingRecording, user }: RecordingClientProps) {
    const router = useRouter();
    const {
        recordingState,
        duration,
        audioLevel,
        error: recordingError,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording
    } = useRecording();

    const [consentChecked, setConsentChecked] = useState(false);
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcriptionStatus, setTranscriptionStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');

    const handleStartClick = () => {
        if (!consentChecked) {
            toast.error("Please confirm you have obtained consent");
            setShowConsentModal(true);
            return;
        }
        addBreadcrumb('Recording start requested', 'recording', 'info');
        startRecording();
    };

    const handleStopClick = async () => {
        const result = await stopRecording();
        if (result && result.blob) {
            handleUpload(result.blob);
        }
    };

    const handleUpload = async (blob: Blob) => {
        setIsProcessing(true);
        setUploadProgress(10);
        addBreadcrumb('Uploading recording', 'recording', 'info', { size: blob.size });

        try {
            const result = await audioUploadService.uploadAudioToSupabase(
                blob,
                appointment.id,
                user.id,
                appointment.mentee_id,
                (progress) => setUploadProgress(progress)
            );

            if (result) {
                toast.success("Recording saved successfully");
                setUploadProgress(100);

                // Trigger Transcription
                setTranscriptionStatus('processing');
                addBreadcrumb('Triggering transcription', 'recording', 'info', { recordingId: result.recordingId });

                const transcriptionResult = await triggerTranscription(result.recordingId);

                if (transcriptionResult.success) {
                    setTranscriptionStatus('completed');
                    toast.success("Transcription started");
                    // Refresh or redirect
                    router.refresh();
                } else {
                    setTranscriptionStatus('failed');
                    toast.error("Transcription failed to start");
                }
            } else {
                throw new Error("Upload returned null");
            }
        } catch (err) {
            console.error(err);
            reportError(err, 'handleUpload', { appointmentId: appointment.id });
            toast.error("Failed to save recording");
        } finally {
            setIsProcessing(false);
        }
    };

    // If already exists
    if (existingRecording) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl flex flex-col items-center gap-4 text-center">
                    <div className="bg-emerald-100 dark:bg-emerald-500/20 p-4 rounded-full">
                        <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recording Completed</h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            Captured on {new Date(existingRecording.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    {existingRecording.recording_status === 'processing' && (
                        <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                            Processing Transcript...
                        </div>
                    )}
                </div>
                <Button onClick={() => router.back()} variant="outline">
                    Back to Session
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <RecordingConsentModal
                open={showConsentModal}
                onConsent={() => {
                    setConsentChecked(true);
                    setShowConsentModal(false);
                    // Optionally start immediately
                }}
                onDecline={() => setShowConsentModal(false)}
            />

            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-4"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Session
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Record Session</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Record audio for AI transcription and clinical note generation.
                </p>
            </div>

            {/* Error Display */}
            {(recordingError) && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    {recordingError}
                </div>
            )}

            {/* Main Interface */}
            <div className="bg-white dark:bg-[#121f24] rounded-3xl p-8 border border-slate-100 dark:border-white/5 shadow-xl space-y-8">

                {/* Consent Checkbox (Only when idle) */}
                {recordingState === 'idle' && !isProcessing && (
                    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-white/5">
                        <input
                            type="checkbox"
                            className="mt-1 w-4 h-4 rounded-md border-slate-300 text-[#30bae8] focus:ring-[#30bae8]"
                            checked={consentChecked}
                            onChange={(e) => setConsentChecked(e.target.checked)}
                        />
                        <div className="text-sm">
                            <p className="font-medium text-slate-900 dark:text-white">Patient Consent Confirmtion</p>
                            <p className="text-slate-500 dark:text-slate-400">
                                I confirm that I have obtained explicit consent from the patient to record this session for medical documentation purposes.
                            </p>
                            <button
                                onClick={() => setShowConsentModal(true)}
                                className="text-[#30bae8] hover:underline mt-1 font-medium"
                            >
                                View scripts
                            </button>
                        </div>
                    </div>
                )}

                {/* Controls */}
                {!isProcessing ? (
                    <RecordingControls
                        recordingState={recordingState}
                        duration={duration}
                        audioLevel={audioLevel}
                        onStart={handleStartClick}
                        onPause={pauseRecording}
                        onResume={resumeRecording}
                        onStop={handleStopClick}
                        disabled={!consentChecked}
                    />
                ) : (
                    /* Processing State */
                    <div className="text-center py-12 space-y-4">
                        <div className="w-16 h-16 border-4 border-[#30bae8] border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Saving Recording...</h3>
                            <p className="text-slate-500 text-sm">Uploading and queuing for transcription</p>
                        </div>
                        <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                    </div>
                )}
            </div>
        </div>
    );
}
