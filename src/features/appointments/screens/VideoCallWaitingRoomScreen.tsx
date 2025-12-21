import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { MotiView } from 'moti';
import { MaterialIcons } from '@expo/vector-icons';
import { useCameraPermissions, CameraView } from 'expo-camera';
import { Audio } from 'expo-av';
import { useAuth } from '../../auth/hooks/useAuth';
import { createGoogleMeetRoom } from '../../../api/videoService';
// import { signInWithGoogle } from '../../../services/googleSignInService';
import { supabase } from '../../../api/supabase';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import RecordingConsentModal from '../../mentor/components/RecordingConsentModal';

type VideoCallWaitingRoomRouteProp = RouteProp<RootStackParamList, 'VideoCallWaitingRoom'>;

export const VideoCallWaitingRoomScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<VideoCallWaitingRoomRouteProp>();
    const { appointmentId, roomId } = route.params;

    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [audioPermission, setAudioPermission] = useState<Audio.PermissionResponse | null>(null);
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { isDark } = useColorScheme();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'speaker' | 'earpiece'>('speaker');
    const [recordingConsent, setRecordingConsent] = useState(false);
    const [showConsentModal, setShowConsentModal] = useState(false);

    const [appointment, setAppointment] = useState<any>(null);

    useEffect(() => {
        const getDetails = async () => {
            if (!cameraPermission?.granted) await requestCameraPermission();
            const audioStatus = await Audio.requestPermissionsAsync();
            setAudioPermission(audioStatus);

            // Fetch appointment details
            const { data } = await supabase
                .from('appointments')
                .select(`
                    *,
                    mentor:profiles!mentor_id(full_name, avatar_url)
                `)
                .eq('id', appointmentId)
                .single();

            if (data) setAppointment(data);
        };
        getDetails();
    }, []);

    const hasPermissions = cameraPermission?.granted && audioPermission?.granted;

    const handleJoin = async () => {
        try {
            if (!user) return;
            setIsLoading(true);
            let accessToken = null;
            try {
                // const result = await signInWithGoogle();
                // if (result) accessToken = result.accessToken;
            } catch (error) {
                console.warn('Google Sign-In skipped');
            }

            const videoRoom = await createGoogleMeetRoom(
                appointmentId,
                user.id,
                user.email || '',
                (user as any).full_name || 'User',
                user.role as 'mentor' | 'mentee',
                accessToken || undefined
            );

            // Here we could update the appointment/room with recording_enabled = true if needed
            // But for now we just proceed as the check is client-side enforced for UI flow.

            navigation.replace('VideoCall', {
                appointmentId,
                roomId: videoRoom.id,
                meetingUrl: videoRoom.room_url,
                googleMeetCode: videoRoom.google_meet_code || videoRoom.room_name,
                token: accessToken || undefined,
            });
        } catch (error: any) {
            Alert.alert('Error', 'Failed to join meeting.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinPress = () => {
        if (!recordingConsent) {
            setShowConsentModal(true);
        } else {
            handleJoin();
        }
    };

    const handleConsent = () => {
        setRecordingConsent(true);
        setShowConsentModal(false);
        // Automatically join after consent? Optional. Let's let them click Join again or just call handleJoin()
        handleJoin();
    };

    const startTime = appointment ? new Date(appointment.start_time) : null;

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <RecordingConsentModal
                visible={showConsentModal}
                onClose={() => {
                    handleConsent();
                }}
                onLearnMore={() => { /* Navigate to privacy policy if needed */ }}
            />
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-background-light/95 dark:bg-background-dark/95 z-50 border-b border-gray-200 dark:border-white/5 pb-2">
                <View className="flex-row items-center justify-between px-4 py-2">
                    <View className="flex-1 items-center pl-10">
                        <Text className="text-lg font-bold tracking-tight text-text-main-light dark:text-text-main-dark">Waiting Room</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 active:bg-gray-300 dark:active:bg-white/20"
                    >
                        <MaterialIcons name="close" size={24} color={isDark ? 'white' : 'black'} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
                <View className="p-4 gap-6">
                    {/* Video Preview */}
                    <View className="relative w-full aspect-[4/5] sm:aspect-video bg-gray-800 rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/10 group">
                        {hasPermissions && cameraOn ? (
                            <CameraView style={{ flex: 1 }} facing="front" />
                        ) : (
                            <View className="flex-1 items-center justify-center bg-gray-900">
                                <MaterialIcons name="videocam-off" size={64} color="#64748b" />
                            </View>
                        )}

                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.6)']}
                            className="absolute inset-0"
                            style={{ pointerEvents: 'none' }}
                        />

                        {/* Badges and Controls */}
                        <View className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                            <Text className="text-white text-sm font-medium">You</Text>
                        </View>

                        <View className="absolute bottom-4 right-4 flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setCameraOn(!cameraOn)}
                                className={`h-12 w-12 items-center justify-center rounded-full shadow-lg border border-white/10 ${!cameraOn ? 'bg-red-500/90' : 'bg-black/40 backdrop-blur-md'}`}
                            >
                                <MaterialIcons name={cameraOn ? "videocam-off" : "videocam"} size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setMicOn(!micOn)}
                                className={`h-12 w-12 items-center justify-center rounded-full shadow-lg border border-white/10 ${!micOn ? 'bg-red-500/90' : 'bg-black/40 backdrop-blur-md'}`}
                            >
                                <MaterialIcons name={micOn ? "mic-off" : "mic"} size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Session Details */}
                    <View className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex-row items-center gap-4">
                        <View className="relative">
                            {appointment?.mentor?.avatar_url ? (
                                <Image
                                    source={{ uri: appointment.mentor.avatar_url }}
                                    className="h-14 w-14 rounded-full bg-gray-200"
                                />
                            ) : (
                                <View className="h-14 w-14 rounded-full bg-indigo-100 items-center justify-center">
                                    <MaterialIcons name="person" size={32} color="#6366f1" />
                                </View>
                            )}
                            <View className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white dark:border-surface-dark" />
                        </View>
                        <View className="flex-1 justify-center">
                            <Text className="text-text-main-light dark:text-text-main-dark text-base font-bold leading-tight">
                                {appointment?.mentor?.full_name || 'Mentor'}
                            </Text>
                            <View className="flex-row items-center gap-2 mt-1">
                                <View className={`px-2 py-0.5 rounded-md ${appointment?.session_type === 'public' ? 'bg-indigo-100' : 'bg-primary/10'}`}>
                                    <Text className={`${appointment?.session_type === 'public' ? 'text-indigo-600' : 'text-primary'} text-xs font-bold uppercase tracking-wider`}>
                                        {appointment?.session_type === 'public' ? 'Public Broadcast' : 'Private Session'}
                                    </Text>
                                </View>
                                <Text className="text-text-sub-light dark:text-text-sub-dark text-sm font-medium">
                                    {startTime && !isNaN(startTime.getTime()) ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </Text>
                            </View>
                            {appointment?.title && (
                                <Text className="text-text-sub-light dark:text-text-sub-dark text-xs mt-1 italic" numberOfLines={1}>
                                    {appointment.title}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* System Checks */}
                    <View>
                        <Text className="text-text-main-light dark:text-text-main-dark text-lg font-bold mb-3 px-1">System Checks</Text>
                        <View className="flex-row gap-3">
                            {/* Mic */}
                            <View className="flex-1 bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 items-center gap-3">
                                <View className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <MaterialIcons name="mic" size={20} color="#22c55e" />
                                </View>
                                <View className="items-center w-full">
                                    <Text className="text-sm font-medium text-text-sub-light dark:text-gray-200">Microphone</Text>
                                    <View className="flex-row gap-0.5 items-end h-3 mt-1 justify-center">
                                        {[1, 0.8, 1.2, 0.9, 1].map((scale, i) => (
                                            <MotiView
                                                key={i}
                                                from={{ height: 4 }}
                                                animate={{ height: 4 * scale * 3 }}
                                                transition={{ type: 'timing', duration: 500, loop: true, delay: i * 100 }}
                                                className="w-1 bg-green-500 rounded-full"
                                            />
                                        ))}
                                    </View>
                                </View>
                            </View>

                            {/* Camera */}
                            <View className="flex-1 bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 items-center gap-3">
                                <View className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <MaterialIcons name="videocam" size={20} color="#22c55e" />
                                </View>
                                <View className="items-center">
                                    <Text className="text-sm font-medium text-text-sub-light dark:text-gray-200">Camera</Text>
                                    <Text className="text-xs text-green-500 font-semibold">Working</Text>
                                </View>
                            </View>

                            {/* Internet */}
                            <View className="flex-1 bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-yellow-500/20 items-center gap-3">
                                <View className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                    <MaterialIcons name="wifi" size={20} color="#eab308" />
                                </View>
                                <View className="items-center">
                                    <Text className="text-sm font-medium text-text-sub-light dark:text-gray-200">Internet</Text>
                                    <Text className="text-xs text-yellow-500 font-semibold">Fair Signal</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Audio Settings */}
                    <View className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-text-main-light dark:text-text-main-dark text-base font-bold">Audio Settings</Text>
                            <TouchableOpacity className="bg-primary/10 px-3 py-1.5 rounded-full">
                                <Text className="text-xs font-bold text-primary">Test Audio</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row items-center gap-2 p-1 bg-gray-100 dark:bg-background-dark/50 rounded-xl">
                            <TouchableOpacity
                                onPress={() => setActiveTab('speaker')}
                                className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg ${activeTab === 'speaker' ? 'bg-white dark:bg-surface-dark shadow-sm' : ''}`}
                            >
                                <MaterialIcons name="volume-up" size={20} color={activeTab === 'speaker' ? '#30bae8' : (isDark ? '#94aeb8' : '#64748b')} />
                                <Text className={`text-sm font-bold ${activeTab === 'speaker' ? 'text-primary' : 'text-text-sub-light dark:text-text-sub-dark'}`}>Speaker</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setActiveTab('earpiece')}
                                className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg ${activeTab === 'earpiece' ? 'bg-white dark:bg-surface-dark shadow-sm' : ''}`}
                            >
                                <MaterialIcons name="hearing" size={20} color={activeTab === 'earpiece' ? '#30bae8' : (isDark ? '#94aeb8' : '#64748b')} />
                                <Text className={`text-sm font-medium ${activeTab === 'earpiece' ? 'text-primary' : 'text-text-sub-light dark:text-text-sub-dark'}`}>Earpiece</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tips */}
                    <View className="pb-4">
                        <Text className="text-text-main-light dark:text-text-main-dark text-lg font-bold mb-3 px-1">Tips for a great session</Text>
                        <View className="space-y-3 px-1 gap-3">
                            <View className="flex-row items-start gap-3">
                                <MaterialIcons name="wb-sunny" size={20} color="#30bae8" />
                                <Text className="text-sm text-text-sub-light dark:text-text-sub-dark leading-normal flex-1">Ensure your face is well-lit and clearly visible.</Text>
                            </View>
                            <View className="flex-row items-start gap-3">
                                <MaterialIcons name="headset" size={20} color="#30bae8" />
                                <Text className="text-sm text-text-sub-light dark:text-text-sub-dark leading-normal flex-1">Using headphones can help reduce echo and noise.</Text>
                            </View>
                            <View className="flex-row items-start gap-3">
                                <MaterialIcons name="wifi-tethering" size={20} color="#30bae8" />
                                <Text className="text-sm text-text-sub-light dark:text-text-sub-dark leading-normal flex-1">Stay close to your router for the best connection.</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            <LinearGradient
                colors={isDark ? ['transparent', '#111d21', '#111d21'] : ['transparent', '#f6f7f8', '#f6f7f8']}
                className="absolute bottom-0 left-0 right-0 p-4 pt-12 z-50"
            >
                <View className="gap-3 max-w-lg mx-auto w-full">
                    <TouchableOpacity
                        onPress={handleJoinPress}
                        disabled={isLoading}
                        className="w-full bg-primary h-14 rounded-full flex-row items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:opacity-90"
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text className="text-white dark:text-slate-900 font-extrabold text-lg">Join Session</Text>
                                <MaterialIcons name="arrow-forward" size={24} color={isDark ? '#0f172a' : 'white'} />
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-full h-12 items-center justify-center rounded-full active:bg-red-50 dark:active:bg-red-900/10"
                    >
                        <Text className="text-red-500 font-bold text-base">Cancel Appointment</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
};
