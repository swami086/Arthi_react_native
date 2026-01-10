'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Mic, MicOff, Video, VideoOff,
    Settings, ShieldCheck, Info,
    Wifi, CheckCircle, Smartphone,
    Monitor, Users, ArrowRight
} from 'lucide-react';
import { useDeviceTesting } from '@/hooks/use-device-testing';
import { RecordingConsentModal } from '@/components/video/recording-consent-modal';
import { createDailyRoom, getDailyRoomToken, updateRoomStatus } from '@/app/actions/video';
import { reportError, addBreadcrumb } from '@/lib/rollbar-utils';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface WaitingRoomClientProps {
    appointment: any;
    user: any;
    role: 'therapist' | 'patient';
}

export default function WaitingRoomClient({ appointment, user, role }: WaitingRoomClientProps) {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number>();

    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [audioLevel, setAudioLevel] = useState(0);
    const [showConsent, setShowConsent] = useState(false);
    const [joining, setJoining] = useState(false);

    const {
        devices,
        testResults,
        testing,
        error: deviceError,
        runTests
    } = useDeviceTesting();

    // Stream Setup
    useEffect(() => {
        let stream: MediaStream | null = null;

        async function setupStream() {
            try {
                // Stop any existing tracks
                if (videoRef.current?.srcObject) {
                    const existingStream = videoRef.current.srcObject as MediaStream;
                    existingStream.getTracks().forEach(t => t.stop());
                }

                if (micOn || cameraOn) {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: cameraOn,
                        audio: micOn
                    });

                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }

                    // Setup Audio Visualizer
                    if (micOn && stream.getAudioTracks().length > 0) {
                        try {
                            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                            const audioContext = new AudioContextClass();
                            const analyser = audioContext.createAnalyser();
                            const microphone = audioContext.createMediaStreamSource(stream);
                            microphone.connect(analyser);
                            analyser.fftSize = 256;

                            audioContextRef.current = audioContext;
                            analyserRef.current = analyser;

                            const dataArray = new Uint8Array(analyser.frequencyBinCount);

                            const updateLevel = () => {
                                if (!analyserRef.current) return;
                                analyserRef.current.getByteFrequencyData(dataArray);
                                const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
                                setAudioLevel(Math.min(100, average * 1.5)); // Start sensitive
                                animationFrameRef.current = requestAnimationFrame(updateLevel);
                            };
                            updateLevel();
                        } catch (e) {
                            console.warn('Audio context setup failed', e);
                        }
                    }
                }
            } catch (err) {
                console.error('Stream setup error', err);
                reportError(err, 'stream-setup-failed');
                // Permission might be denied
                setCameraOn(false);
                setMicOn(false);
            }
        }

        setupStream();

        return () => {
            // Cleanup
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [micOn, cameraOn]);

    // Initial Test Run
    useEffect(() => {
        runTests();
    }, [runTests]);

    const handleJoinClick = () => {
        // Run final check or just show consent
        setShowConsent(true);
    };

    const handleConsentGiven = async () => {
        setShowConsent(false);
        setJoining(true);

        try {
            // 1. Ensure room exists
            addBreadcrumb('Creating/Fetching Room', 'waiting-room');
            const roomResult = await createDailyRoom(appointment.id);
            if (!roomResult.success || !roomResult.room) {
                throw new Error(roomResult.error || 'Failed to create room');
            }

            if (!roomResult.success || !roomResult.room) {
                // room property exists if success is true based on action definition
                throw new Error(roomResult.error || 'Failed to create room');
            }

            const roomName = roomResult.room.room_name;

            // 2. Get Token
            const tokenResult = await getDailyRoomToken(roomName, user.id, role);
            if (!tokenResult.success || !tokenResult.token) {
                throw new Error(tokenResult.error || 'Failed to generate token');
            }

            // 3. Update status (optional, client calls page update immediately usually) on join
            // We usually update status to 'active' inside the call page when 'joined-meeting' event fires.

            // 4. Navigate to Call Page
            // Optionally pass camera/mic state via URL params or local storage to persist preference
            const params = new URLSearchParams();
            if (!micOn) params.append('mic', 'off');
            if (!cameraOn) params.append('cam', 'off');

            router.push(`/video/${appointment.id}/call?${params.toString()}`);

        } catch (err) {
            reportError(err, 'join-session-failed', { appointmentId: appointment.id });
            toast.error((err as Error).message || 'Failed to join session');
            setJoining(false);
        }
    };

    const therapist = appointment.therapist;

    return (
        <div className="min-h-screen bg-background-light dark:bg-[#0e181b] flex flex-col md:flex-row">
            <RecordingConsentModal
                open={showConsent}
                onConsent={handleConsentGiven}
                onDecline={() => setShowConsent(false)}
            />

            {/* Left Column: Preview */}
            <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col justify-center items-center relative">
                <div className="w-full max-w-md relative aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden bg-slate-900 shadow-2xl ring-1 ring-white/10">
                    <video
                        ref={videoRef}
                        muted
                        autoPlay
                        playsInline
                        className={`w-full h-full object-cover ${!cameraOn ? 'hidden' : ''}`}
                    />

                    {!cameraOn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
                                <VideoOff className="w-8 h-8 text-slate-400" />
                            </div>
                        </div>
                    )}

                    {/* Overlays */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setMicOn(!micOn)}
                            className={`p-3 rounded-full transition-all ${micOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/80 text-white'}`}
                        >
                            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setCameraOn(!cameraOn)}
                            className={`p-3 rounded-full transition-all ${cameraOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/80 text-white'}`}
                        >
                            {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </button>
                    </div>

                    {micOn && (
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                            <div className="flex gap-0.5 items-end h-4">
                                {[1, 2, 3, 4].map(i => (
                                    <motion.div
                                        key={i}
                                        className="w-1 bg-green-400 rounded-sm"
                                        animate={{ height: Math.max(4, audioLevel * (i * 0.5 + 0.5)) + '%' }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        style={{ height: '4px' }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* System Checks */}
                <div className="w-full max-w-md mt-6 grid grid-cols-3 gap-4">
                    <StatusCard
                        icon={<Mic className="w-4 h-4" />}
                        label="Microphone"
                        status={testResults.audioInput}
                        loading={testing}
                    />
                    <StatusCard
                        icon={<Video className="w-4 h-4" />}
                        label="Camera"
                        status={testResults.videoInput}
                        loading={testing}
                    />
                    <StatusCard
                        icon={<Wifi className="w-4 h-4" />}
                        label="Internet"
                        status={testResults.network}
                        loading={testing}
                    />
                </div>

                {deviceError && (
                    <div className="w-full max-w-md mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2">
                        <Info className="w-4 h-4 shrink-0" />
                        <span>{deviceError.message}</span>
                    </div>
                )}
            </div>

            {/* Right Column: Context */}
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-white dark:bg-[#121f24] border-l border-slate-200 dark:border-white/5">
                <div className="max-w-md mx-auto w-full space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Ready to join?</h1>
                        <p className="text-slate-500 dark:text-[#94aeb8]">Please check your setup before entering the session.</p>
                    </div>

                    {/* Appointment Info Card */}
                    <div className="bg-slate-50 dark:bg-[#1a2a2e] p-5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-4">
                        <Avatar className="h-14 w-14 border-2 border-white dark:border-[#30bae8]/20">
                            <AvatarImage src={therapist?.avatar_url || ''} />
                            <AvatarFallback>{therapist?.full_name?.[0] || 'M'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-[#94aeb8] uppercase tracking-wider mb-0.5">Session with</p>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{therapist?.full_name}</h3>
                            <p className="text-xs text-[#30bae8]">{appointment.duration_minutes || 60} mins • Private Session</p>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Info className="w-4 h-4 text-[#30bae8]" />
                            Tips for a great session
                        </h4>
                        <ul className="space-y-3">
                            <TipItem icon={<ShieldCheck />} text="Your session is end-to-end encrypted and private." />
                            <TipItem icon={<Wifi />} text="Ensure you have a stable internet connection." />
                            <TipItem icon={<Monitor />} text="Close other heavy applications for better quality." />
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex flex-col gap-3">
                        <Button
                            className="w-full h-12 text-base bg-[#30bae8] hover:bg-[#30bae8]/90 text-white font-bold rounded-xl shadow-lg shadow-[#30bae8]/20"
                            onClick={handleJoinClick}
                            disabled={joining || testing}
                        >
                            {joining ? 'Connecting...' : 'Join Session'}
                            {!joining && <ArrowRight className="w-5 h-5 ml-2" />}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-slate-600 dark:text-[#94aeb8] hover:bg-slate-100 dark:hover:bg-white/5"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusCard({ icon, label, status, loading }: { icon: React.ReactNode, label: string, status: boolean, loading: boolean }) {
    return (
        <div className="bg-white dark:bg-[#1a2a2e] p-3 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col items-center gap-2 text-center transition-all">
            <div className={`p-2 rounded-full ${loading ? 'bg-slate-100 dark:bg-white/5 animate-pulse' : status ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {icon}
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-slate-600 dark:text-[#94aeb8]">{label}</span>
                <span className={`text-[10px] font-bold uppercase ${status ? 'text-emerald-500' : 'text-red-500'} ${loading ? 'opacity-0' : 'opacity-100'}`}>
                    {status ? 'Ready' : 'Check'}
                </span>
            </div>
        </div>
    );
}

function TipItem({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <li className="flex items-start gap-3 bg-white dark:bg-[#1a2a2e]/50 p-3 rounded-lg border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-colors">
            <div className="text-slate-400 dark:text-[#94aeb8] mt-0.5 [&>svg]:w-4 [&>svg]:h-4">
                {icon}
            </div>
            <span className="text-sm text-slate-600 dark:text-[#94aeb8] leading-tight">{text}</span>
        </li>
    );
}
