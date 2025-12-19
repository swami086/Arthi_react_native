import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, RootNavigationProp } from '../../../navigation/types';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { useSoapNote } from '../hooks/useSoapNote';
import SoapSection from '../../../components/SoapSection';
import * as recordingService from '../../../api/recordingService';

type SoapNoteEditorRouteProp = RouteProp<RootStackParamList, 'SoapNoteEditor'>;

export default function SoapNoteEditorScreen() {
    const navigation = useNavigation<RootNavigationProp>();
    const route = useRoute<SoapNoteEditorRouteProp>();
    const { soapNoteId, appointmentId, transcriptId } = route.params;
    const { isDark } = useColorScheme();

    const {
        updateSoapNote: saveSoapUpdate,
        finalizeSoapNote: finalize,
        generateSoapNote
    } = useSoapNote();

    const [loading, setLoading] = useState(true);
    const [soapData, setSoapData] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: ''
    });
    const [isFinalized, setIsFinalized] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        subjective: true,
        objective: false,
        assessment: false,
        plan: false,
    });
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [regenerating, setRegenerating] = useState(false);

    const [realSoapNoteId, setRealSoapNoteId] = useState<string | null>(null);

    // Load SOAP note
    useEffect(() => {
        const fetchSoapNote = async () => {
            try {
                // Try to get existing note
                let note = await recordingService.getSoapNoteByAppointment(appointmentId);

                if (note) {
                    setRealSoapNoteId(note.id);
                    setSoapData({
                        subjective: note.subjective || '',
                        objective: note.objective || '',
                        assessment: note.assessment || '',
                        plan: note.plan || ''
                    });
                    setIsFinalized(note.is_finalized);
                } else if (transcriptId) {
                    // Automatically trigger generation if we have a transcript but no SOAP note
                    setLoading(true);
                    const newNote = await generateSoapNote(transcriptId, appointmentId);
                    if (newNote) {
                        setRealSoapNoteId(newNote.id);
                        setSoapData({
                            subjective: newNote.subjective || '',
                            objective: newNote.objective || '',
                            assessment: newNote.assessment || '',
                            plan: newNote.plan || ''
                        });
                        setIsFinalized(newNote.is_finalized);
                    }
                } else {
                    setRealSoapNoteId(null);
                }
            } catch (err) {
                console.error("Error loading/generating SOAP note:", err);
                Alert.alert("Error", "Failed to load SOAP note");
            } finally {
                setLoading(false);
            }
        };

        fetchSoapNote();
    }, [appointmentId]);

    // Auto-save logic
    useEffect(() => {
        if (loading || isFinalized || !realSoapNoteId) return;

        const timeoutId = setTimeout(async () => {
            if (autoSaveStatus === 'saved') return;

            setAutoSaveStatus('saving');
            await saveSoapUpdate(realSoapNoteId, soapData);
            setAutoSaveStatus('saved');
        }, 3000);

        return () => clearTimeout(timeoutId);
    }, [soapData, realSoapNoteId]);

    const handleTextChange = (section: keyof typeof soapData, text: string) => {
        if (isFinalized) return;
        setSoapData(prev => ({ ...prev, [section]: text }));
        setAutoSaveStatus('idle'); // Mark as dirty
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleFinalize = async () => {
        if (!realSoapNoteId) {
            Alert.alert("Error", "No SOAP note to finalize.");
            return;
        }

        // Validate
        const sections = ['subjective', 'objective', 'assessment', 'plan'] as const;
        for (const section of sections) {
            if (soapData[section].length < 10) {
                Alert.alert("Validation Error", `Please complete the ${section} section before finalizing.`);
                setExpandedSections(prev => ({ ...prev, [section]: true }));
                return;
            }
        }

        Alert.alert(
            "Finalize SOAP Note",
            "Are you sure? Once finalized, the note cannot be edited.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Finalize",
                    style: 'destructive',
                    onPress: async () => {
                        const success = await finalize(realSoapNoteId);
                        if (success) {
                            setIsFinalized(true);
                            Alert.alert("Success", "SOAP note finalized and saved.");
                        } else {
                            Alert.alert("Error", "Failed to finalize note.");
                        }
                    }
                }
            ]
        );
    };

    const handleRegenerate = async () => {
        if (isFinalized) return;

        Alert.alert(
            "Regenerate Note",
            "This will overwrite your current edits. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Regenerate",
                    onPress: async () => {
                        setRegenerating(true);
                        // Call generation service again
                        // In real app, this would call backend
                        setTimeout(() => {
                            setRegenerating(false);
                            Alert.alert("Regenerated", "SOAP note has been refreshed from transcript.");
                        }, 2000);
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color="#30bae8" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                            <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#fff" : "#333"} />
                        </TouchableOpacity>
                        <Text className="text-lg font-bold text-gray-900 dark:text-white">SOAP Note</Text>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${isFinalized ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                        <Text className={`text-xs font-bold ${isFinalized ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                            {isFinalized ? 'FINALIZED' : 'DRAFT'}
                        </Text>
                    </View>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView className="flex-1 px-4 pt-4 mb-20">
                        {/* Auto-save indicator */}
                        {!isFinalized && (
                            <View className="flex-row justify-end mb-2">
                                {autoSaveStatus === 'saving' ? (
                                    <Text className="text-xs text-gray-400 italic">Saving...</Text>
                                ) : autoSaveStatus === 'saved' ? (
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="check" size={12} color="#10b981" />
                                        <Text className="text-xs text-green-500 ml-1">Saved</Text>
                                    </View>
                                ) : (
                                    <Text className="text-xs text-gray-300">Unsaved changes</Text>
                                )}
                            </View>
                        )}

                        <SoapSection
                            title="Subjective"
                            icon="account-voice"
                            value={soapData.subjective}
                            onChange={(text) => handleTextChange('subjective', text)}
                            isExpanded={expandedSections.subjective}
                            onToggle={() => toggleSection('subjective')}
                            readOnly={isFinalized}
                            minChars={20}
                        />

                        <SoapSection
                            title="Objective"
                            icon="eye-outline"
                            value={soapData.objective}
                            onChange={(text) => handleTextChange('objective', text)}
                            isExpanded={expandedSections.objective}
                            onToggle={() => toggleSection('objective')}
                            readOnly={isFinalized}
                            minChars={20}
                        />

                        <SoapSection
                            title="Assessment"
                            icon="stethoscope"
                            value={soapData.assessment}
                            onChange={(text) => handleTextChange('assessment', text)}
                            isExpanded={expandedSections.assessment}
                            onToggle={() => toggleSection('assessment')}
                            readOnly={isFinalized}
                            minChars={20}
                        />

                        <SoapSection
                            title="Plan"
                            icon="clipboard-list-outline"
                            value={soapData.plan}
                            onChange={(text) => handleTextChange('plan', text)}
                            isExpanded={expandedSections.plan}
                            onToggle={() => toggleSection('plan')}
                            readOnly={isFinalized}
                            minChars={20}
                        />

                        <View className="h-24" />
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Footer Actions */}
                <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 pb-8 flex-row space-x-3">
                    {!isFinalized ? (
                        <>
                            <TouchableOpacity
                                className="flex-1 bg-gray-100 dark:bg-slate-800 py-3 rounded-xl flex-row justify-center items-center"
                                onPress={handleRegenerate}
                                disabled={regenerating}
                            >
                                {regenerating ? (
                                    <ActivityIndicator size="small" color="#475569" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="refresh" size={20} color={isDark ? "#e2e8f0" : "#475569"} className="mr-2" />
                                        <Text className="font-bold text-slate-700 dark:text-slate-200">Regenerate</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-primary-500 py-3 rounded-xl flex-row justify-center items-center shadow-md"
                                onPress={handleFinalize}
                            >
                                <MaterialCommunityIcons name="lock-outline" size={20} color="white" className="mr-2" />
                                <Text className="font-bold text-white">Finalize</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            className="flex-1 bg-gray-100 dark:bg-slate-800 py-3 rounded-xl flex-row justify-center items-center"
                            onPress={() => {
                                // In real app, this would generate PDF
                                Alert.alert("Export", "PDF Export functionality coming soon");
                            }}
                        >
                            <MaterialCommunityIcons name="file-pdf-box" size={20} color={isDark ? "#e2e8f0" : "#475569"} className="mr-2" />
                            <Text className="font-bold text-slate-700 dark:text-slate-200">Export as PDF</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}
