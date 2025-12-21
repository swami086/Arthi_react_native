import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/types';
import { Appointment } from '../../../api/types';
import { supabase } from '../../../api/supabase';
import { GradientAvatar } from '../../../components/GradientAvatar';
import { updateAppointmentStatus } from '../../../api/mentorService';
import { useColorScheme } from '../../../hooks/useColorScheme';

// AI Scribe Imports
import { useRecording } from '../hooks/useRecording';
import { useTranscription } from '../hooks/useTranscription';
import { useSoapNote } from '../hooks/useSoapNote';
import ConsentCheckbox from '../components/ConsentCheckbox';
import RecordingControls from '../components/RecordingControls';
import ProcessingProgress from '../components/ProcessingProgress';
import RecordingConsentModal from '../components/RecordingConsentModal';
import { uploadAudioToSupabase, UploadProgress } from '../../../services/audioUploadService';
import { RootNavigationProp } from '../../../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

type SessionDetailRouteProp = RouteProp<RootStackParamList, 'SessionDetail'>;

export default function SessionDetailScreen() {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<SessionDetailRouteProp>();
    const { appointmentId } = route.params || {};
    const { isDark } = useColorScheme();

    const [appointment, setAppointment] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    // AI Scribe State
    const [consentGiven, setConsentGiven] = useState(false);
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [processingStep, setProcessingStep] = useState<'uploading' | 'transcribing' | 'generating' | 'completed'>('uploading');
    const [processingProgress, setProcessingProgress] = useState(0);
    const [transcriptId, setTranscriptId] = useState<string | null>(null);
    const [soapNoteId, setSoapNoteId] = useState<string | null>(null);

    // AI Scribe Hooks
    const {
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        recordingState,
        duration,
        metering,
        error: recordingError
    } = useRecording();

    const {
        triggerTranscription,
        isProcessing: isTranscribing,
        error: transcriptionError
    } = useTranscription();

    const {
        generateSoapNote,
        isGenerating: isGeneratingSoap,
        error: soapError
    } = useSoapNote();

    useEffect(() => {
        if (recordingError) Alert.alert('Recording Error', recordingError);
        if (transcriptionError) Alert.alert('Transcription Error', transcriptionError);
        if (soapError) Alert.alert('SOAP Generation Error', soapError);
    }, [recordingError, transcriptionError, soapError]);


    const handleStopRecording = async () => {
        const result = await stopRecording();
        if (result && result.uri) {
            // Start processing workflow
            setProcessingStep('uploading');
            setProcessingProgress(0);

            try {
                // 1. Upload to Supabase Storage
                const uploadResult = await uploadAudioToSupabase(
                    result.uri,
                    appointmentId,
                    appointment.mentor_id,
                    appointment.mentee_id,
                    (progress: UploadProgress) => setProcessingProgress(Math.min(Math.round(progress.percentage * 0.3), 30))
                );

                if (!uploadResult) {
                    throw new Error("Upload failed");
                }

                setProcessingProgress(35);
                setProcessingStep('transcribing');

                // 2. Transcribe (using Edge Function)
                const transcriptResult = await triggerTranscription(uploadResult.recordingId);

                if (!transcriptResult || !transcriptResult.id) {
                    throw new Error("Transcription failed");
                }

                setTranscriptId(transcriptResult.id);
                setProcessingProgress(66);
                setProcessingStep('generating');

                // 3. Generate SOAP Note (using Edge Function)
                const soapResult = await generateSoapNote(transcriptResult.id, appointmentId);

                if (!soapResult) {
                    throw new Error("SOAP note generation failed");
                }

                setSoapNoteId(soapResult.id);
                setProcessingProgress(100);
                setProcessingStep('completed');

                Alert.alert('Success', 'Session processed successfully! You can now view the transcript and SOAP note.');

            } catch (err) {
                console.error("Processing Error:", err);
                Alert.alert("Processing Error", "Failed to process the recording. Please try again.");
                setProcessingStep('completed');
                // Don't reset everything, allow retry? For now handled by restart recording which is default UI behavior if state is idle
            }
        }
    };

    useEffect(() => {
        if (!appointmentId) return;

        const fetchAppointment = async () => {
            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .select('*, profiles:mentee_id(full_name, avatar_url)')
                    .eq('id', appointmentId)
                    .single();

                if (error) throw error;
                setAppointment(data);
                setNotes(data.notes || '');

                // Check for existing AI Scribe data
                const { data: recording } = await supabase
                    .from('session_recordings')
                    .select('id, recording_status')
                    .eq('appointment_id', appointmentId)
                    .maybeSingle();

                if (recording) {
                    const { data: transcript } = await supabase
                        .from('transcripts')
                        .select('id')
                        .eq('recording_id', recording.id)
                        .maybeSingle();

                    if (transcript) {
                        setTranscriptId(transcript.id);

                        const { data: soap } = await supabase
                            .from('soap_notes')
                            .select('id')
                            .eq('transcript_id', transcript.id)
                            .maybeSingle();

                        if (soap) {
                            setSoapNoteId(soap.id);
                            setProcessingStep('completed');
                        } else {
                            // Recording and transcript exist, but no SOAP note
                            setProcessingStep('completed'); // Or keep it at completed since we found the transcript
                        }
                    } else if (recording.recording_status === 'completed') {
                        // Recording exists but no transcript yet (maybe failed or in progress)
                    }
                }
            } catch (err) {
                console.error("Error fetching session state:", err);
                Alert.alert("Error", "Failed to fetch session details");
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [appointmentId]);

    const handleUpdateStatus = async (status: string) => {
        try {
            setSaving(true);
            await updateAppointmentStatus(appointmentId, status, notes);
            setAppointment((prev: any) => ({ ...prev, status, notes }));
            Alert.alert("Success", `Session marked as ${status}`);
        } catch (err) {
            Alert.alert("Error", "Failed to update session");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotes = async () => {
        try {
            setSaving(true);
            await updateAppointmentStatus(appointmentId, appointment.status, notes); // Only update notes
            Alert.alert("Success", "Notes saved");
        } catch (err) {
            Alert.alert("Error", "Failed to save notes");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color="#30bae8" />
            </View>
        );
    }

    if (!appointment) return null;

    const mentee = appointment.profiles;

    return (
        <View className="flex-1 bg-white dark:bg-[#111d21]">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Top Header */}
            <SafeAreaView edges={['top']} className="bg-white/95 dark:bg-[#111d21]/95 z-50 border-b border-gray-100 dark:border-white/5">
                <View className="px-4 py-3 flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#fff" : "#1e293b"} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">Session Details</Text>
                    <TouchableOpacity className="w-10 h-10 items-center justify-center">
                        <MaterialCommunityIcons name="dots-vertical" size={24} color={isDark ? "#94a3b8" : "#94a3b8"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

                {/* Profile Header */}
                <View className="p-4">
                    <View className="flex-row items-center gap-4 bg-white dark:bg-[#1a2a2e] p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                        <View className="relative">
                            <GradientAvatar
                                source={mentee?.avatar_url ? { uri: mentee.avatar_url } : { uri: 'https://via.placeholder.com/150' }}
                                size={64}
                            />
                            <View className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-white dark:border-[#1a2a2e] rounded-full" />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row justify-between items-start">
                                <View>
                                    <Text className="text-slate-900 dark:text-white text-xl font-bold">{mentee?.full_name || 'Mentee'}</Text>
                                    <Text className="text-slate-500 dark:text-[#93bac8] text-sm font-medium mt-1">Mentee • Career Growth</Text>
                                </View>
                                <View className="bg-[#30bae8]/10 px-2.5 py-1 rounded-md">
                                    <Text className="text-[#30bae8] text-xs font-bold uppercase">{appointment.status}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Session Details List */}
                <View className="px-4 space-y-3 gap-3">
                    {/* Date/Time */}
                    <View className="flex-row items-center gap-4 bg-white dark:bg-[#1a2a2e] px-4 py-3 rounded-2xl border border-gray-100 dark:border-white/5">
                        <View className="items-center justify-center rounded-xl bg-[#30bae8]/10 h-10 w-10">
                            <MaterialCommunityIcons name="calendar-month" size={20} color="#30bae8" />
                        </View>
                        <View>
                            <Text className="text-slate-900 dark:text-white text-base font-semibold">
                                {new Date(appointment.start_time).toLocaleDateString()} • {new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-xs">45 mins duration</Text>
                        </View>
                    </View>

                    {/* Location */}
                    <View className="flex-row items-center gap-4 bg-white dark:bg-[#1a2a2e] px-4 py-3 rounded-2xl border border-gray-100 dark:border-white/5">
                        <View className="items-center justify-center rounded-xl bg-[#30bae8]/10 h-10 w-10">
                            <MaterialCommunityIcons name="video" size={20} color="#30bae8" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-900 dark:text-white text-base font-semibold">Online Session</Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-xs">Google Meet Available</Text>
                        </View>
                        {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('VideoCallWaitingRoom', {
                                    appointmentId: appointment.id,
                                    roomId: ''
                                })}
                            >
                                <Text className="text-[#30bae8] font-bold text-sm">Join</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View className="h-6" />

                {/* AI Scribe Section */}
                <View className="mx-4 overflow-hidden rounded-[2rem]">
                    <LinearGradient
                        colors={['#1a2c32', '#142328']}
                        className="p-6 border border-[#243e47]"
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-6 z-10">
                            <View className="flex-row items-center gap-2">
                                <MaterialCommunityIcons name="robot" size={24} color="#30bae8" />
                                <Text className="text-white text-lg font-bold">AI Scribe</Text>
                            </View>
                            <View className="bg-[#243e47] px-2 py-1 rounded-md">
                                <Text className="text-[#93bac8] text-xs font-bold">BETA</Text>
                            </View>
                        </View>

                        {/* Controls */}
                        {processingStep !== 'completed' && !soapNoteId && (
                            <>
                                {!consentGiven && (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => setConsentGiven(!consentGiven)}
                                        className="flex-row gap-3 mb-8 z-10"
                                    >
                                        <View className={`h-5 w-5 rounded border-2 items-center justify-center ${consentGiven ? 'bg-[#30bae8] border-[#30bae8]' : 'border-[#345965]'}`}>
                                            {consentGiven && <MaterialCommunityIcons name="check" size={14} color="#111d21" />}
                                        </View>
                                        <Text className="text-slate-300 text-sm flex-1 leading-5">
                                            I have obtained verbal consent from the patient to record this session.
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {consentGiven && (
                                    <View className="items-center justify-center gap-4 z-10">
                                        <View className="relative items-center justify-center">
                                            {recordingState === 'recording' && (
                                                <MotiView
                                                    from={{ opacity: 0.5, scale: 1 }}
                                                    animate={{ opacity: 0, scale: 1.5 }}
                                                    transition={{ type: 'timing', duration: 1000, loop: true }}
                                                    className="absolute w-20 h-20 rounded-full bg-[#30bae8]/30"
                                                />
                                            )}

                                            <TouchableOpacity
                                                onPress={() => recordingState === 'idle' ? startRecording() : stopRecording()}
                                                className={`h-20 w-20 items-center justify-center rounded-full shadow-lg ${recordingState === 'recording' ? 'bg-red-500' : 'bg-[#30bae8]'}`}
                                            >
                                                <MaterialCommunityIcons name={recordingState === 'recording' ? "stop" : "microphone"} size={32} color={recordingState === 'recording' ? "white" : "#111d21"} />
                                            </TouchableOpacity>
                                        </View>
                                        <View className="items-center">
                                            <Text className="text-white font-bold text-base">
                                                {recordingState === 'recording' ? formatDuration(duration) : "Tap to Record"}
                                            </Text>
                                            <Text className="text-[#93bac8] text-xs mt-1">
                                                {recordingState === 'recording' ? "Recording in progress..." : "Audio is processed securely"}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </>
                        )}

                        {(soapNoteId || processingStep === 'completed') && (
                            <View className="items-center py-4 z-10">
                                <View className="h-16 w-16 bg-green-500/20 rounded-full items-center justify-center mb-3">
                                    <MaterialCommunityIcons name="check-circle" size={32} color="#22c55e" />
                                </View>
                                <Text className="text-white font-bold text-lg">Session Processed</Text>
                                <Text className="text-slate-400 text-sm mb-6">Transcript and SOAP note ready.</Text>

                                <View className="flex-row gap-3 w-full">
                                    <TouchableOpacity
                                        className="flex-1 bg-[#243e47] py-3 rounded-xl flex-row justify-center items-center"
                                        onPress={() => navigation.navigate('TranscriptViewer', { transcriptId: transcriptId!, appointmentId })}
                                    >
                                        <Text className="text-white font-bold text-sm">Transcript</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="flex-1 bg-[#30bae8] py-3 rounded-xl flex-row justify-center items-center"
                                        onPress={() => navigation.navigate('SoapNoteEditor', { soapNoteId: soapNoteId!, appointmentId, transcriptId: transcriptId! })}
                                    >
                                        <Text className="text-[#111d21] font-bold text-sm">SOAP Note</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Status for processing */}
                        {processingStep !== 'completed' && processingStep !== 'uploading' && processingProgress > 0 && !soapNoteId && (
                            <View className="mt-4">
                                <Text className="text-[#93bac8] text-xs mb-2 text-center capitalize">{processingStep}...</Text>
                                <View className="h-1 bg-[#243e47] rounded-full overflow-hidden w-full">
                                    <View className="h-full bg-[#30bae8]" style={{ width: `${processingProgress}%` }} />
                                </View>
                            </View>
                        )}

                    </LinearGradient>
                </View>

                <View className="h-6" />

                {/* Notes Section */}
                <View className="px-4">
                    <Text className="text-slate-900 dark:text-white text-lg font-bold mb-3 px-1">Session Notes</Text>
                    <View className="bg-white dark:bg-[#1a2a2e] rounded-2xl p-4 border border-gray-100 dark:border-white/5 min-h-[160px]">
                        <View className="flex-row items-center gap-2 mb-3">
                            <MaterialCommunityIcons name="history" size={16} color="#93bac8" />
                            <Text className="text-xs uppercase tracking-wider font-bold text-[#93bac8]">Previous Note Summary</Text>
                        </View>
                        <Text className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                            {notes ? notes.substring(0, 100) + (notes.length > 100 ? '...' : '') : "No previous notes."}
                        </Text>
                        <View className="h-[1px] bg-gray-100 dark:bg-gray-700 my-2" />
                        <TextInput
                            className="text-slate-900 dark:text-white text-base min-h-[80px]"
                            placeholder="Add manual notes here..."
                            placeholderTextColor="#64748b"
                            multiline
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>
                </View>

            </ScrollView>

            {/* Sticky Footer */}
            <View className="absolute bottom-0 w-full bg-white/95 dark:bg-[#111d21]/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 p-4 pb-8 z-50">
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        className="flex-1 h-12 rounded-full border border-gray-300 dark:border-gray-600 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                        onPress={() => navigation.goBack()}
                    >
                        <Text className="text-slate-700 dark:text-white font-bold text-sm">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-[2] h-12 rounded-full bg-[#30bae8] items-center justify-center flex-row gap-2 shadow-lg shadow-blue-500/25"
                        onPress={() => handleUpdateStatus('completed')}
                    >
                        <MaterialCommunityIcons name="check-circle-outline" size={20} color="#111d21" />
                        <Text className="text-[#111d21] font-bold text-sm">Mark as Completed</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// Helper to format duration
const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
