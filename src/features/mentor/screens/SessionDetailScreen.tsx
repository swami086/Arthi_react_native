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
        <View className="flex-1 bg-white dark:bg-gray-900">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <SafeAreaView className="flex-1">
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Header */}
                    <View className="px-6 py-4 flex-row items-center border-b border-gray-100 dark:border-gray-700 mb-6">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                            <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#fff" : "#333"} />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">Session Details</Text>
                    </View>

                    {/* Mentee Info */}
                    <View className="px-6 items-center mb-8">
                        <GradientAvatar
                            source={mentee?.avatar_url ? { uri: mentee.avatar_url } : { uri: 'https://via.placeholder.com/150' }}
                            size={80}
                        />
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mt-3">{mentee?.full_name || 'Mentee'}</Text>
                        <View className={`px-3 py-1 rounded-full mt-2 bg-gray-100 dark:bg-gray-800`}>
                            <Text className="text-gray-600 dark:text-gray-300 font-bold uppercase text-xs">{appointment.status}</Text>
                        </View>
                    </View>

                    {/* Meta Data */}
                    <View className="px-6 mb-8 flex-row justify-around">
                        <View className="items-center">
                            <MaterialCommunityIcons name="calendar" size={24} color="#30bae8" />
                            <Text className="text-gray-900 dark:text-white font-bold mt-1">{new Date(appointment.start_time).toLocaleDateString()}</Text>
                            <Text className="text-gray-400 dark:text-gray-500 text-xs">Date</Text>
                        </View>
                        <View className="items-center">
                            <MaterialCommunityIcons name="clock-outline" size={24} color="#30bae8" />
                            <Text className="text-gray-900 dark:text-white font-bold mt-1">{new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            <Text className="text-gray-400 dark:text-gray-500 text-xs">Time</Text>
                        </View>
                        <View className="items-center">
                            <MaterialCommunityIcons name="video" size={24} color={appointment.meeting_link ? "#10B981" : "#9CA3AF"} />
                            <Text className="text-gray-900 dark:text-white font-bold mt-1">{appointment.meeting_link ? 'Online' : 'TBD'}</Text>
                            <Text className="text-gray-400 dark:text-gray-500 text-xs">Location</Text>
                        </View>
                    </View>

                    {/* Meeting Link */}
                    {appointment.meeting_link && (appointment.status === 'confirmed' || appointment.status === 'pending') && (
                        <View className="px-6 mb-8">
                            <TouchableOpacity
                                className="bg-blue-500 py-4 rounded-xl flex-row justify-center items-center shadow-md shadow-blue-200"
                                onPress={() => Linking.openURL(appointment.meeting_link)}
                            >
                                <MaterialCommunityIcons name="video" size={24} color="white" className="mr-2" />
                                <Text className="text-white font-bold text-lg">Join Meeting</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* AI Scribe Section */}
                    <View className="px-6 mb-8">
                        <View className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {/* Header */}
                            <View className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 p-4 border-b border-gray-100 dark:border-gray-700 flex-row justify-between items-center">
                                <View className="flex-row items-center">
                                    <View className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg mr-3">
                                        <MaterialCommunityIcons name="robot" size={20} color="#3b82f6" />
                                    </View>
                                    <View>
                                        <Text className="font-bold text-slate-800 dark:text-white text-base">AI Scribe</Text>
                                        <Text className="text-xs text-slate-500 dark:text-slate-400">Automated documentation</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => setShowConsentModal(true)}>
                                    <MaterialCommunityIcons name="information-outline" size={22} color={isDark ? '#94a3b8' : '#64748b'} />
                                </TouchableOpacity>
                            </View>

                            {/* Content */}
                            <View className="p-4">
                                {processingStep !== 'completed' && recordingState === 'idle' && !soapNoteId && (
                                    <>
                                        <View className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-4 border border-amber-100 dark:border-amber-800/50">
                                            <Text className="text-xs text-amber-800 dark:text-amber-200 leading-4">
                                                Record your session to automatically generate a transcript and SOAP note. Requires patient consent.
                                            </Text>
                                        </View>

                                        <ConsentCheckbox
                                            checked={consentGiven}
                                            onChange={setConsentGiven}
                                            label="I have obtained verbal consent from the patient to record this session for clinical documentation purposes."
                                        />
                                    </>
                                )}

                                {(consentGiven || recordingState !== 'idle' || soapNoteId) && !soapNoteId && (
                                    <RecordingControls
                                        recordingState={recordingState}
                                        duration={duration}
                                        onStart={startRecording}
                                        onPause={pauseRecording}
                                        onResume={resumeRecording}
                                        onStop={handleStopRecording}
                                        metering={metering}
                                    />
                                )}

                                {(processingStep !== 'uploading' || processingProgress > 0) && !soapNoteId && (
                                    <ProcessingProgress
                                        progress={processingProgress}
                                        status={processingStep}
                                    />
                                )}

                                {soapNoteId && (
                                    <View className="items-center py-2">
                                        <View className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-3">
                                            <MaterialCommunityIcons name="check-circle" size={32} color="#10b981" />
                                        </View>
                                        <Text className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                                            Session Processed
                                        </Text>
                                        <Text className="text-slate-500 dark:text-slate-400 text-center text-sm mb-4">
                                            Transcript and SOAP note are ready for review.
                                        </Text>

                                        <View className="flex-row w-full space-x-3">
                                            <TouchableOpacity
                                                className="flex-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 py-3 rounded-xl flex-row justify-center items-center"
                                                onPress={() => navigation.navigate('TranscriptViewer', {
                                                    transcriptId: transcriptId!,
                                                    appointmentId
                                                })}
                                            >
                                                <MaterialCommunityIcons name="text-box-outline" size={20} color={isDark ? '#e2e8f0' : '#475569'} className="mr-2" />
                                                <Text className="font-semibold text-slate-700 dark:text-slate-200">Transcript</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                className="flex-1 bg-primary-500 py-3 rounded-xl flex-row justify-center items-center shadow-md"
                                                onPress={() => navigation.navigate('SoapNoteEditor', {
                                                    soapNoteId: soapNoteId!,
                                                    appointmentId,
                                                    transcriptId: transcriptId!
                                                })}
                                            >
                                                <MaterialCommunityIcons name="file-document-edit-outline" size={20} color="white" className="mr-2" />
                                                <Text className="font-bold text-white">SOAP Note</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    <RecordingConsentModal
                        visible={showConsentModal}
                        onClose={() => setShowConsentModal(false)}
                    />

                    {/* Notes Section */}
                    <View className="px-6 mb-6">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">Session Notes</Text>
                            <TouchableOpacity onPress={handleSaveNotes} disabled={saving}>
                                <Text className="text-primary font-bold">{saving ? 'Saving...' : 'Save'}</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-gray-800 dark:text-white min-h-[120px] text-base"
                            placeholder="Add private notes about this session..."
                            multiline
                            textAlignVertical="top"
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>

                    {/* Feedback Section (if completed) */}
                    {appointment.feedback && (
                        <View className="px-6 mb-8">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Mentee Feedback</Text>
                            <View className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                                <Text className="text-gray-700 dark:text-gray-300 italic">"{appointment.feedback}"</Text>
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View className="px-6 mt-4 gap-3">
                        {appointment.status === 'pending' && (
                            <TouchableOpacity
                                className="bg-green-500 py-3 rounded-xl items-center"
                                onPress={() => handleUpdateStatus('confirmed')}
                            >
                                <Text className="text-white font-bold text-base">Confirm Session</Text>
                            </TouchableOpacity>
                        )}
                        {appointment.status === 'confirmed' && (
                            <TouchableOpacity
                                className="bg-gray-900 py-3 rounded-xl items-center"
                                onPress={() => handleUpdateStatus('completed')}
                            >
                                <Text className="text-white font-bold text-base">Mark as Completed</Text>
                            </TouchableOpacity>
                        )}
                        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                            <TouchableOpacity
                                className="bg-red-50 py-3 rounded-xl items-center border border-red-100"
                                onPress={() => handleUpdateStatus('cancelled')}
                            >
                                <Text className="text-red-500 font-bold text-base">Cancel Session</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
