'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    DailyProvider,
    useDaily,
    useParticipantIds,
    useLocalParticipant,
    useVideoTrack,
    useAudioTrack,
    DailyVideo,
    DailyAudio
} from '@daily-co/daily-react';
import {
    Mic, MicOff, Video, VideoOff,
    PhoneOff, MessageSquare,
    Users, Monitor, MoreVertical,
    Signal, SignalLow, SignalZero
} from 'lucide-react';
import { updateRoomStatus } from '@/app/actions/video';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoCallClientProps {
    roomUrl: string;
    token: string;
    appointment: any;
    user: any;
}

import DailyIframe from '@daily-co/daily-js';
import { reportError, addBreadcrumb, setRollbarUser } from '@/lib/rollbar-utils';
import { useMemo } from 'react';

export default function VideoCallClientWrapper(props: VideoCallClientProps) {
    const callObject = useMemo(() => DailyIframe.createCallObject(), []);

    useEffect(() => {
        setRollbarUser(props.user.id, props.user.email, props.user.full_name, { role: props.user.role });
        addBreadcrumb('Video call initiated', 'video-call', 'info', { appointmentId: props.appointment.id });

        return () => {
            callObject.destroy();
        };
    }, [callObject, props.user, props.appointment]);

    return (
        <DailyProvider callObject={callObject}>
            <VideoCallClient {...props} />
        </DailyProvider>
    );
}

function VideoCallClient({ roomUrl, token, appointment, user }: VideoCallClientProps) {
    const callObject = useDaily();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Preferences from waiting room
    const initialMicOff = searchParams.get('mic') === 'off';
    const initialCamOff = searchParams.get('cam') === 'off';

    const [hasJoined, setHasJoined] = useState(false);
    const [callError, setCallError] = useState<string | null>(null);

    // Initial Join
    useEffect(() => {
        if (!callObject) return;

        const joinRoom = async () => {
            try {
                addBreadcrumb('Joining Daily room', 'video-call', 'info', { roomUrl });
                // Apply initial settings
                await callObject.setLocalAudio(!initialMicOff);
                await callObject.setLocalVideo(!initialCamOff);

                await callObject.join({ url: roomUrl, token });

                // Update status to active
                await updateRoomStatus(appointment.video_room.id, 'active');
                setHasJoined(true);
            } catch (err: any) {
                console.error('Join error', err);
                reportError(err, 'joinRoom', { roomUrl, appointmentId: appointment.id });
                setCallError(err.message || 'Failed to join meeting');
                toast.error('Could not join the session.');
            }
        };

        if (!hasJoined) {
            joinRoom();
        }

        return () => {
            // Cleanup handled by DailyProvider mostly, but explicit leave is good
            if (callObject && hasJoined) {
                callObject.leave();
            }
        };
    }, [callObject, roomUrl, token, hasJoined, initialMicOff, initialCamOff, appointment]);

    // Event listeners
    useEffect(() => {
        if (!callObject) return;

        const handleLeft = async () => {
            // Update status to ended
            await updateRoomStatus(appointment.video_room.id, 'ended');
            router.push(`/video/${appointment.id}/feedback`);
        };

        const handleError = (e: any) => {
            // Filter out minor errors or warnings if needed
            reportError(e, 'daily-event-error', { errorMsg: e.errorMsg });
            toast.error(`Call error: ${e.errorMsg}`);
        };

        callObject.on('left-meeting', handleLeft);
        callObject.on('error', handleError);

        return () => {
            callObject.off('left-meeting', handleLeft);
            callObject.off('error', handleError);
        };
    }, [callObject, router, appointment]);

    const handleLeave = async () => {
        if (callObject) {
            await callObject.leave();
            // 'left-meeting' event will trigger navigation
        }
    };

    if (callError) {
        return (
            <div className="h-screen flex items-center justify-center flex-col gap-4 bg-background-light dark:bg-[#0e181b]">
                <h2 className="text-xl text-red-500 font-bold">Failed to join session</h2>
                <p className="text-slate-500">{callError}</p>
                <Button onClick={() => router.push('/appointments')}>Return to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-[#0e181b] relative overflow-hidden flex flex-col">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center gap-3">
                    <span className="bg-red-500 w-2 h-2 rounded-full animate-pulse"></span>
                    <span className="text-white font-medium text-sm tracking-wide">
                        {appointment.mentor.full_name} • {appointment.duration_minutes} min session
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5 flex items-center gap-2">
                        <Signal className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-white/80 font-medium">Stable</span>
                    </div>
                </div>
            </header>

            {/* Video Grid */}
            <main className="flex-1 p-4 flex items-center justify-center">
                <VideoGrid />
            </main>

            {/* Controls */}
            <footer className="p-6 flex justify-center items-center gap-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <CallControls onLeave={handleLeave} />
            </footer>
        </div>
    );
}

function VideoGrid() {
    const participantIds = useParticipantIds();
    const localId = useLocalParticipant()?.session_id;

    // In a 1:1 call, we usually want remote participant large and local small (PIP)
    const remoteId = participantIds.find(id => id !== localId);

    return (
        <div className="relative w-full h-full max-w-6xl flex items-center justify-center">
            {remoteId ? (
                // Remote View
                <div className="w-full h-full rounded-3xl overflow-hidden bg-slate-900 shadow-2xl relative border border-white/10">
                    <VideoTile id={remoteId} isLocal={false} />
                    <DailyAudio /> {/* Handles incoming audio */}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-white/50 gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                        <Users className="w-8 h-8 opacity-50" />
                    </div>
                    <p>Waiting for other participant...</p>
                </div>
            )}

            {/* Local View (PIP) */}
            {localId && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 right-4 w-32 md:w-48 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-[#30bae8]/30 bg-slate-800 z-20"
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Simplified constraints for now
                >
                    <VideoTile id={localId} isLocal={true} />
                </motion.div>
            )}
        </div>
    );
}

function VideoTile({ id, isLocal }: { id: string; isLocal: boolean }) {
    const videoState = useVideoTrack(id);
    // const audioState = useAudioTrack(id); // Use for visualizer or mute state

    return (
        <div className="w-full h-full relative group">
            <DailyVideo
                automirror={isLocal}
                sessionId={id}
                type="video"
                className="w-full h-full object-cover"
            />
            {/* Label */}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {isLocal ? 'You' : 'Remote'}
                {videoState.isOff && ' (Camera Off)'}
            </div>

            {/* Fallback when video is off */}
            {videoState.isOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                            {isLocal ? 'Me' : 'User'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

function CallControls({ onLeave }: { onLeave: () => void }) {
    const callObject = useDaily();
    const local = useLocalParticipant();

    // Toggle handlers
    const toggleAudio = useCallback(() => callObject?.setLocalAudio(!local?.audio), [callObject, local]);
    const toggleVideo = useCallback(() => callObject?.setLocalVideo(!local?.video), [callObject, local]);

    return (
        <div className="flex items-center gap-3 md:gap-6 bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-full shadow-2xl">
            {/* Mic */}
            <ControlBtn
                onClick={toggleAudio}
                isActive={!!local?.audio}
                onIcon={<Mic />}
                offIcon={<MicOff />}
                label="Mic"
            />

            {/* Camera */}
            <ControlBtn
                onClick={toggleVideo}
                isActive={!!local?.video}
                onIcon={<Video />}
                offIcon={<VideoOff />}
                label="Camera"
            />

            {/* Divider */}
            <div className="w-px h-8 bg-white/20 mx-1"></div>

            {/* End Call */}
            <Button
                onClick={onLeave}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 py-6 shadow-lg shadow-red-500/20"
            >
                <PhoneOff className="w-5 h-5 fill-current" />
            </Button>

            {/* Extra Options */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1a2a2e] border-white/10 text-white">
                    <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                        <MessageSquare className="w-4 h-4 mr-2" /> Chat (Coming Soon)
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                        <Monitor className="w-4 h-4 mr-2" /> Share Screen
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function ControlBtn({ onClick, isActive, onIcon, offIcon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-full transition-all duration-200 ${isActive
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-white text-slate-900 border-2 border-white'
                }`}
            title={label}
        >
            <div className="w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                {isActive ? onIcon : offIcon}
            </div>
        </button>
    );
}
