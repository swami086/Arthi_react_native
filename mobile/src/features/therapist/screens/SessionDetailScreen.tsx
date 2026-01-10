import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/types';
import { supabase } from '../../../api/supabase';
import { updateAppointmentStatus } from '../../../api/mentorService';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { useRecording } from '../hooks/useRecording';
import { useTranscription } from '../hooks/useTranscription';
import { useSoapNote } from '../hooks/useSoapNote';
import { uploadAudioToSupabase, UploadProgress } from '../../../services/audioUploadService';
import { RootNavigationProp } from '../../../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';

type SessionDetailRouteProp = RouteProp<RootStackParamList, 'SessionDetail'>;

// Figma Assets
const ASSETS = {
    LIGHT: {
        TIME: "http://localhost:3845/assets/9427fc8b12838206b2b2793bfcc42bd66658d2eb.png",
        DURATION: "http://localhost:3845/assets/163d30f1eb5c3e2bcb71028e65fc34542d73c07b.png",
        TRANSCRIPT: "http://localhost:3845/assets/1e049a9bbc647a75e62928d07a3efb25ccc3c5b3.svg", // SVG might need handling, but I'll use it in Image or custom component
        SOAP: "http://localhost:3845/assets/cb74be5161e3bfe8676e897de08468a6f352259d.png",
    },
    DARK: {
        MENTEE: "http://localhost:3845/assets/6d0e071d5bd9f4e15e380e7cd225d44fe21cac42.png",
    },
    OVERVIEW: {
        MENTOR: "http://localhost:3845/assets/afbcf77a5150244acdb20935b8f1ffabbccd4a27.png",
        MENTEE: "http://localhost:3845/assets/9ab0e98fee7cb0c1735de328af79f35c60c80aeb.png",
        DATE: "http://localhost:3845/assets/bf323afc6e15221813fe3c54f03e21759071f830.png",
        NOTES_DECO: "http://localhost:3845/assets/cb74be5161e3bfe8676e897de08468a6f352259d.png",
    }
};

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
    const [processingStep, setProcessingStep] = useState<'uploading' | 'transcribing' | 'generating' | 'completed' | 'idle'>('idle');
    const [processingProgress, setProcessingProgress] = useState(0);
    const [transcriptId, setTranscriptId] = useState<string | null>(null);
    const [soapNoteId, setSoapNoteId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'overview' | 'scribe'>('overview');

    // AI Scribe Hooks
    const {
        startRecording,
        stopRecording,
        recordingState,
        duration,
        error: recordingError
    } = useRecording();

    const {
        triggerTranscription,
        error: transcriptionError
    } = useTranscription();

    const {
        generateSoapNote,
        error: soapError
    } = useSoapNote();

    useEffect(() => {
        if (recordingError) Alert.alert('Recording Error', recordingError);
        if (transcriptionError) Alert.alert('Transcription Error', transcriptionError);
        if (soapError) Alert.alert('SOAP Generation Error', soapError);
    }, [recordingError, transcriptionError, soapError]);

    useEffect(() => {
        if (!appointmentId) return;

        const fetchAppointment = async () => {
            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .select('*, profiles:mentee_id(full_name, avatar_url), mentor:mentor_id(full_name, avatar_url, bio)')
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
                            setViewMode('scribe');
                        } else {
                            setProcessingStep('completed');
                            setViewMode('scribe');
                        }
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

    const handleStopRecording = async () => {
        const result = await stopRecording();
        if (result && result.uri) {
            setProcessingStep('uploading');
            setProcessingProgress(10);

            try {
                const uploadResult = await uploadAudioToSupabase(
                    result.uri,
                    appointmentId,
                    appointment.mentor_id,
                    appointment.mentee_id,
                    (progress: UploadProgress) => setProcessingProgress(Math.min(Math.round(progress.percentage * 0.3), 30))
                );

                if (!uploadResult) throw new Error("Upload failed");

                setProcessingProgress(40);
                setProcessingStep('transcribing');

                const transcriptResult = await triggerTranscription(uploadResult.recordingId);
                if (!transcriptResult || !transcriptResult.id) throw new Error("Transcription failed");

                setTranscriptId(transcriptResult.id);
                setProcessingProgress(70);
                setProcessingStep('generating');

                const soapResult = await generateSoapNote(transcriptResult.id, appointmentId);
                if (!soapResult) throw new Error("SOAP note generation failed");

                setSoapNoteId(soapResult.id);
                setProcessingProgress(100);
                setProcessingStep('completed');

            } catch (err) {
                console.error("Processing Error:", err);
                Alert.alert("Processing Error", "Failed to process the recording.");
                setProcessingStep('idle');
            }
        }
    };

    const handleUpdateStatus = async (status: string) => {
        try {
            setSaving(true);
            await updateAppointmentStatus(appointmentId, status, notes);
            setAppointment((prev: any) => ({ ...prev, status }));
            Alert.alert("Success", `Session marked as ${status}`);
        } catch (err) {
            Alert.alert("Error", "Failed to update session");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !appointment) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-[#111d21]">
                <ActivityIndicator size="large" color="#30bae8" />
            </View>
        );
    }

    const mentee = appointment.profiles;
    const mentor = appointment.mentor;

    const renderOverview = () => (
        <View className="flex-1 bg-[#f7fafc]">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView edges={['top']} className="px-4 py-4 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold font-['Manrope']">Session Detail</Text>
                <View style={{ width: 24 }} />
            </SafeAreaView>

            <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
                <Text className="text-lg font-bold mb-4 font-['Manrope']">Session Information</Text>

                {/* Therapist Card */}
                <View className="bg-white rounded-[24px] p-4 flex-row items-center mb-4 shadow-sm border border-gray-50">
                    <View className="flex-1">
                        <Text className="text-[#a0aec0] text-xs font-medium uppercase tracking-wider mb-1">Therapist</Text>
                        <Text className="text-lg font-bold text-[#1a202c]">{mentor?.full_name || 'Dr. Anya Sharma'}</Text>
                        <Text className="text-[#4a5568] text-sm">Psychologist</Text>
                    </View>
                    <Image source={{ uri: ASSETS.OVERVIEW.MENTOR }} className="w-[100px] h-[64px] rounded-lg" resizeMode="cover" />
                </View>

                {/* Patient Card */}
                <View className="bg-white rounded-[24px] p-4 flex-row items-center mb-4 shadow-sm border border-gray-50">
                    <View className="flex-1">
                        <Text className="text-[#a0aec0] text-xs font-medium uppercase tracking-wider mb-1">Patient</Text>
                        <Text className="text-lg font-bold text-[#1a202c]">{mentee?.full_name || 'Ethan Carter'}</Text>
                        <Text className="text-[#4a5568] text-sm">Student</Text>
                    </View>
                    <Image source={{ uri: ASSETS.OVERVIEW.MENTEE }} className="w-[100px] h-[64px] rounded-lg" resizeMode="cover" />
                </View>

                {/* Date Card */}
                <View className="bg-white rounded-[24px] p-4 flex-row items-center mb-8 shadow-sm border border-gray-50">
                    <View className="flex-1">
                        <Text className="text-[#a0aec0] text-xs font-medium uppercase tracking-wider mb-1">Date</Text>
                        <Text className="text-lg font-bold text-[#1a202c]">{new Date(appointment.start_time).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                        <Text className="text-[#4a5568] text-sm">{new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(appointment.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <Image source={{ uri: ASSETS.OVERVIEW.DATE }} className="w-[100px] h-[64px] rounded-lg" resizeMode="contain" />
                </View>

                <Text className="text-lg font-bold mb-4 font-['Manrope']">Session Notes</Text>
                <View className="bg-white rounded-[24px] p-6 items-center justify-center mb-10 shadow-sm border border-gray-50">
                    <Image source={{ uri: ASSETS.OVERVIEW.NOTES_DECO }} className="w-[160px] h-[160px] mb-4" resizeMode="contain" />
                    <TouchableOpacity onPress={() => setViewMode('scribe')} className="bg-[#30bae8]/10 px-4 py-2 rounded-full">
                        <Text className="text-[#30bae8] font-bold">Open AI Scribe</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View className="px-4 pb-10 gap-3">
                <TouchableOpacity className="bg-[#30bae8] py-4 rounded-2xl items-center" onPress={() => handleUpdateStatus('confirmed')}>
                    <Text className="text-white font-bold text-lg">Confirm Session</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-[#edf2f7] py-4 rounded-2xl items-center" onPress={() => handleUpdateStatus('completed')}>
                    <Text className="text-[#4a5568] font-bold text-lg">Mark as Completed</Text>
                </TouchableOpacity>
                <TouchableOpacity className="py-4 items-center" onPress={() => navigation.goBack()}>
                    <Text className="text-[#4a5568] font-bold">Cancel Session</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderLightScribe = () => (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView edges={['top']} className="px-4 py-4 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">Session Detail</Text>
                <View style={{ width: 24 }} />
            </SafeAreaView>

            <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
                <Text className="text-2xl font-bold mb-6">Session with {mentee?.full_name?.split(' ')[0] || 'Alex'}</Text>

                <View className="flex-row gap-4 mb-8">
                    <View className="flex-1 bg-[#f7fafc] p-4 rounded-2xl flex-row items-center gap-3">
                        <Image source={{ uri: ASSETS.LIGHT.TIME }} className="w-10 h-10" />
                        <View>
                            <Text className="font-bold text-slate-800">10:00 AM - 11:00 AM</Text>
                            <Text className="text-xs text-slate-400">10/26/2024</Text>
                        </View>
                    </View>
                    <View className="flex-1 bg-[#f7fafc] p-4 rounded-2xl flex-row items-center gap-3">
                        <Image source={{ uri: ASSETS.LIGHT.DURATION }} className="w-10 h-10" />
                        <View>
                            <Text className="font-bold text-slate-800">Duration</Text>
                            <Text className="text-xs text-slate-400">60 minutes</Text>
                        </View>
                    </View>
                </View>

                <Text className="text-xl font-bold mb-4">AI Scribe</Text>
                <View className="bg-[#f7fafc] p-4 rounded-2xl flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-3">
                        <View className="bg-white p-2 rounded-xl">
                            <Ionicons name="mic-outline" size={24} color="black" />
                        </View>
                        <Text className="font-bold">Record Session</Text>
                    </View>
                    <Switch
                        value={recordingState === 'recording'}
                        onValueChange={(val) => {
                            if (val) {
                                startRecording();
                            } else {
                                handleStopRecording();
                            }
                        }}
                        trackColor={{ true: '#30bae8' }}
                    />
                </View>
                <Text className="text-sm text-slate-500 leading-relaxed mb-8">
                    By recording this session, you agree to our terms and conditions.
                </Text>

                {recordingState !== 'idle' || processingStep !== 'idle' ? (
                    <View className="mb-10">
                        <Text className="text-lg font-bold mb-2">Processing Recording</Text>
                        <View className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                            <View className="h-full bg-black" style={{ width: `${processingProgress}%` }} />
                        </View>
                        <Text className="text-slate-400 text-sm">Step {processingStep === 'uploading' ? '1' : processingStep === 'transcribing' ? '2' : '3'} of 3</Text>
                    </View>
                ) : null}

                {processingStep === 'completed' && (
                    <View>
                        <Text className="text-xl font-bold mb-4">Recording Processed</Text>
                        <View className="flex-row items-center gap-4 mb-6">
                            <View className="flex-1">
                                <Text className="text-xs text-[#638087] mb-1">AI Scribe</Text>
                                <Text className="text-lg font-bold mb-1">Session Transcript</Text>
                                <Text className="text-sm text-slate-400 mb-3">View the full transcript of your session with Alex.</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('TranscriptViewer', { transcriptId: transcriptId!, appointmentId })} className="bg-slate-100 py-2 px-6 rounded-lg self-start">
                                    <Text className="font-bold">View</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="w-24 h-24 bg-slate-50 rounded-2xl items-center justify-center">
                                <Feather name="file-text" size={40} color="#638087" />
                            </View>
                        </View>

                        <View className="flex-row items-center gap-4 mb-20">
                            <View className="flex-1">
                                <Text className="text-xs text-[#638087] mb-1">AI Scribe</Text>
                                <Text className="text-lg font-bold mb-1">SOAP Notes</Text>
                                <Text className="text-sm text-slate-400 mb-3">Review AI-generated SOAP notes from your session.</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('SoapNoteEditor', { soapNoteId: soapNoteId!, appointmentId, transcriptId: transcriptId! })} className="bg-slate-100 py-2 px-6 rounded-lg self-start">
                                    <Text className="font-bold">View</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="w-24 h-24 bg-slate-50 rounded-2xl items-center justify-center">
                                <Ionicons name="document-text-outline" size={40} color="#638087" />
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );

    const renderDarkScribe = () => (
        <View className="flex-1 bg-[#121f21]">
            <StatusBar barStyle="light-content" />
            <SafeAreaView edges={['top']} className="px-4 py-4 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-white">Session Details</Text>
                <View style={{ width: 24 }} />
            </SafeAreaView>

            <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
                <Text className="text-2xl font-bold text-white mb-6">Session with {mentee?.full_name?.split(' ')[0] || 'Alex'}</Text>

                <View className="space-y-3 gap-3 mb-8">
                    <View className="flex-row items-center gap-4 bg-[#1a2b33] p-4 rounded-xl">
                        <View className="bg-[#2a3d45] p-2 rounded-lg">
                            <Ionicons name="calendar" size={24} color="#30bae8" />
                        </View>
                        <View>
                            <Text className="text-white font-bold text-base">Today</Text>
                            <Text className="text-[#94bac7] text-sm">12:00 PM - 1:00 PM</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-4 bg-[#1a2b33] p-4 rounded-xl">
                        <Image source={{ uri: ASSETS.DARK.MENTEE }} className="w-12 h-12 rounded-full" />
                        <View>
                            <Text className="text-[#94bac7] text-sm">Patient</Text>
                            <Text className="text-white font-bold text-base">{mentee?.full_name || 'Alex'}</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-4 bg-[#1a2b33] p-4 rounded-xl">
                        <View className="bg-[#2a3d45] p-2 rounded-lg">
                            <Ionicons name="time" size={24} color="#30bae8" />
                        </View>
                        <View>
                            <Text className="text-[#94bac7] text-sm">Status</Text>
                            <Text className="text-white font-bold text-base">{appointment.status === 'confirmed' ? 'In progress' : 'Scheduled'}</Text>
                        </View>
                    </View>
                </View>

                <Text className="text-xl font-bold text-white mb-4">AI Scribe</Text>

                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={() => setConsentGiven(!consentGiven)}
                            className={`w-6 h-6 rounded border ${consentGiven ? 'bg-[#30bae8] border-[#30bae8]' : 'border-gray-500'} items-center justify-center`}
                        >
                            {consentGiven && <Ionicons name="checkmark" size={16} color="white" />}
                        </TouchableOpacity>
                        <Text className="text-white text-base">Consent</Text>
                    </View>
                    <Switch value={consentGiven} onValueChange={setConsentGiven} trackColor={{ true: '#30bae8' }} />
                </View>

                <View className="flex-row items-center justify-between bg-[#1a2b33] p-4 rounded-xl mb-8">
                    <View className="flex-row items-center gap-4">
                        <View className="bg-[#2a3d45] p-2 rounded-lg">
                            <Ionicons name="mic" size={24} color="#30bae8" />
                        </View>
                        <Text className="text-white font-bold">Start Recording</Text>
                    </View>
                    <TouchableOpacity
                        disabled={!consentGiven}
                        onPress={() => recordingState === 'idle' ? startRecording() : handleStopRecording()}
                        className={`px-6 py-2 rounded-full ${recordingState === 'recording' ? 'bg-red-500' : 'bg-[#2a3d45]'}`}
                    >
                        <Text className="text-white font-bold">{recordingState === 'recording' ? 'Stop' : 'Start'}</Text>
                    </TouchableOpacity>
                </View>

                {(recordingState !== 'idle' || processingStep !== 'idle') && (
                    <View className="mb-8">
                        <Text className="text-white font-bold text-lg mb-4">Processing</Text>
                        <View className="h-2 bg-[#2a3d45] rounded-full overflow-hidden mb-4">
                            <View className="h-full bg-[#30bae8]" style={{ width: `${processingProgress}%` }} />
                        </View>
                        <Text className="text-[#94bac7] text-base">{processingProgress}%</Text>
                    </View>
                )}

                {processingStep === 'completed' && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('TranscriptViewer', { transcriptId: transcriptId!, appointmentId })}
                        className="flex-row items-center justify-between bg-[#1a2b33] p-4 rounded-xl mb-20"
                    >
                        <View className="flex-row items-center gap-4">
                            <View className="bg-[#30bae8]/20 p-2 rounded-lg">
                                <Ionicons name="checkmark-circle" size={24} color="#30bae8" />
                            </View>
                            <Text className="text-white font-bold">Recording Processed</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="white" />
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );

    const renderBottomTab = () => (
        <View className={`${isDark ? 'bg-[#1a2b33] border-[#2a3d45]' : 'bg-white border-gray-100'} border-t pt-2 pb-8 flex-row justify-around items-center`}>
            <TouchableOpacity className="items-center" onPress={() => navigation.navigate('Home' as any)}>
                <Ionicons name="home" size={24} color={isDark ? "#30bae8" : "#30bae8"} />
                <Text className={`${isDark ? 'text-[#30bae8]' : 'text-[#30bae8]'} text-[10px] mt-1 font-bold`}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => navigation.navigate('Sessions' as any)}>
                <Ionicons name="calendar" size={24} color={isDark ? "#94bac7" : "#a0aec0"} />
                <Text className={`${isDark ? 'text-[#94bac7]' : 'text-[#a0aec0]'} text-[10px] mt-1`}>Sessions</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
                <Ionicons name="grid" size={24} color={isDark ? "#94bac7" : "#a0aec0"} />
                <Text className={`${isDark ? 'text-[#94bac7]' : 'text-[#a0aec0]'} text-[10px] mt-1`}>Resources</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => navigation.navigate('Profile' as any)}>
                <Ionicons name="person" size={24} color={isDark ? "#94bac7" : "#a0aec0"} />
                <Text className={`${isDark ? 'text-[#94bac7]' : 'text-[#a0aec0]'} text-[10px] mt-1`}>Profile</Text>
            </TouchableOpacity>
        </View>
    );

    // Main render
    return (
        <View className="flex-1">
            {viewMode === 'overview' ? renderOverview() : (isDark ? renderDarkScribe() : renderLightScribe())}
            {renderBottomTab()}
        </View>
    );
}
