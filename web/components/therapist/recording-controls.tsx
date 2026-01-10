'use client';

import { motion } from 'framer-motion';
import { Mic, Pause, Square, Play } from 'lucide-react';
import { RecordingState } from '@/types/recording';
import { AudioWaveform } from '@/components/ui/audio-waveform';
import { cn } from '@/lib/utils';
import { colors } from '@/design-system/tokens';

interface RecordingControlsProps {
    recordingState: RecordingState;
    duration: number;
    audioLevel: number;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    disabled?: boolean;
}

export function RecordingControls({
    recordingState,
    duration,
    audioLevel,
    onStart,
    onPause,
    onResume,
    onStop,
    disabled = false
}: RecordingControlsProps) {

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isRecording = recordingState === 'recording';
    const isPaused = recordingState === 'paused';
    const isIdle = recordingState === 'idle';

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            {/* Status Text */}
            <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isIdle && "Ready to record"}
                    {isRecording && "Recording in progress..."}
                    {isPaused && "Recording paused"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isIdle ? "Speak clearly for best transcription" : formatTime(duration)}
                </p>
            </div>

            {/* Waveform & Controls */}
            <div className="flex items-center justify-center gap-4 w-full">
                {/* Left Waveform */}
                <AudioWaveform
                    isRecording={isRecording}
                    audioLevel={audioLevel}
                    barCount={15}
                    className="opacity-50"
                />

                {/* Main Button */}
                <div className="relative">
                    {/* Ripple Effect when recording */}
                    {isRecording && (
                        <>
                            <motion.div
                                className="absolute inset-0 rounded-full bg-red-500/20"
                                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            />
                            <motion.div
                                className="absolute inset-0 rounded-full bg-red-500/20"
                                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                            />
                        </>
                    )}

                    {!isIdle ? (
                        <div className="flex items-center gap-3">
                            {/* Pause/Resume */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={isPaused ? onResume : onPause}
                                className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center border border-slate-200 dark:border-slate-700"
                            >
                                {isPaused ? (
                                    <Play className="w-6 h-6 text-slate-900 dark:text-white ml-1" />
                                ) : (
                                    <Pause className="w-6 h-6 text-slate-900 dark:text-white" />
                                )}
                            </motion.button>

                            {/* Stop */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onStop}
                                className="w-20 h-20 rounded-full bg-red-500 shadow-xl shadow-red-500/20 flex items-center justify-center z-10"
                            >
                                <Square className="w-8 h-8 text-white fill-current" />
                            </motion.button>
                        </div>
                    ) : (
                        /* Start Button */
                        <motion.button
                            whileHover={{ scale: disabled ? 1 : 1.05 }}
                            whileTap={{ scale: disabled ? 1 : 0.95 }}
                            onClick={onStart}
                            disabled={disabled}
                            className={cn(
                                "w-20 h-20 rounded-full shadow-xl flex items-center justify-center z-10 transition-colors",
                                disabled
                                    ? "bg-slate-200 dark:bg-slate-800 cursor-not-allowed text-slate-400"
                                    : "bg-[#30bae8] shadow-[#30bae8]/30 text-white"
                            )}
                        >
                            <Mic className="w-8 h-8" />
                        </motion.button>
                    )}
                </div>

                {/* Right Waveform */}
                <AudioWaveform
                    isRecording={isRecording}
                    audioLevel={audioLevel}
                    barCount={15}
                    className="opacity-50"
                />
            </div>
        </div>
    );
}
