import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/types';
import { useColorScheme } from '../../../hooks/useColorScheme';
import * as recordingService from '../../../api/recordingService';
import MetadataCard from '../../../components/MetadataCard';

type TranscriptViewerRouteProp = RouteProp<RootStackParamList, 'TranscriptViewer'>;

export default function TranscriptViewerScreen() {
    const navigation = useNavigation();
    const route = useRoute<TranscriptViewerRouteProp>();
    const { transcriptId, appointmentId } = route.params;
    const { isDark } = useColorScheme();

    const [transcript, setTranscript] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedText, setHighlightedText] = useState<React.ReactNode[]>([]);

    useEffect(() => {
        const fetchTranscript = async () => {
            try {
                const data = await recordingService.getTranscriptByRecording(transcriptId.replace('trans_', 'rec_'));
                // Use placeholder if not found (for dev)
                if (!data) {
                    setTranscript({
                        id: transcriptId,
                        transcript_text: "Speaker 1: Hello, how have you been feeling since our last session?\n\nSpeaker 2: I've been feeling a bit better, but still struggling with anxiety in social situations. I tried the breathing exercises you recommended.\n\nSpeaker 1: That's great to hear. Can you tell me more about how the breathing exercises worked for you?\n\nSpeaker 2: They helped me calm down when I started feeling overwhelmed at work yesterday. My heart rate went down and I could focus again.\n\nSpeaker 1: Excellent. It sounds like you're building good coping mechanisms. Let's discuss triggers...",
                        word_count: 85,
                        language_detected: 'English',
                        duration: '45 mins' // Added for UI
                    });
                } else {
                    setTranscript(data);
                }
            } catch (err) {
                Alert.alert("Error", "Failed to load transcript");
            } finally {
                setLoading(false);
            }
        };

        fetchTranscript();
    }, [transcriptId]);

    // Search functionality
    useEffect(() => {
        if (!transcript) return;

        if (!searchQuery.trim()) {
            setHighlightedText([<Text key="full" className="text-slate-700 dark:text-slate-300 text-base leading-6 font-mono">{transcript.transcript_text}</Text>]);
            return;
        }

        const text = transcript.transcript_text;
        const regex = new RegExp(`(${searchQuery})`, 'gi');
        const parts = text.split(regex);

        const nodes = parts.map((part: string, index: number) => {
            if (part.toLowerCase() === searchQuery.toLowerCase()) {
                return (
                    <Text key={index} className="bg-yellow-300 text-slate-900 font-bold">
                        {part}
                    </Text>
                );
            }
            return <Text key={index} className="text-slate-700 dark:text-slate-300 text-base leading-6 font-mono">{part}</Text>;
        });

        setHighlightedText(nodes);
    }, [searchQuery, transcript]);

    const handleCopy = () => {
        // In a real app, use Clipboard.setString
        Alert.alert("Copied", "Transcript copied to clipboard");
    };

    const handleExport = async () => {
        try {
            await Share.share({
                message: transcript?.transcript_text || '',
                title: 'Session Transcript'
            });
        } catch (error) {
            Alert.alert("Error", "Failed to share transcript");
        }
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
                        <Text className="text-lg font-bold text-gray-900 dark:text-white">Transcript</Text>
                    </View>
                    <TouchableOpacity
                        className="bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg"
                        onPress={() => {
                            // If SOAP note exists, navigate to it, otherwise generate (nav only for now)
                             navigation.navigate('SoapNoteEditor', {
                                soapNoteId: `soap_${Date.now()}`,
                                appointmentId: appointmentId || '',
                                transcriptId
                            });
                        }}
                    >
                        <Text className="text-primary-600 dark:text-primary-400 font-semibold text-xs">Generate SOAP</Text>
                    </TouchableOpacity>
                </View>

                {/* Metadata */}
                <View className="flex-row px-4 py-4 space-x-2">
                    <MetadataCard icon="clock-outline" label="Duration" value="45m" />
                    <MetadataCard icon="format-font" label="Word Count" value={transcript?.word_count || 0} />
                    <MetadataCard icon="translate" label="Language" value={transcript?.language_detected || 'En'} />
                </View>

                {/* Search Bar */}
                <View className="px-4 mb-4">
                    <View className="flex-row items-center bg-gray-100 dark:bg-slate-800 rounded-xl px-3 py-2">
                        <MaterialCommunityIcons name="magnify" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                        <TextInput
                            className="flex-1 ml-2 text-base text-slate-800 dark:text-white h-10"
                            placeholder="Search in transcript..."
                            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <MaterialCommunityIcons name="close-circle" size={18} color={isDark ? "#94a3b8" : "#64748b"} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Transcript Content */}
                <ScrollView className="flex-1 px-4">
                    <View className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl min-h-[300px] mb-24">
                        <Text className="flex-wrap flex-row">
                            {highlightedText}
                        </Text>
                    </View>
                </ScrollView>

                {/* Footer Actions */}
                <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 pb-8 flex-row space-x-3">
                    <TouchableOpacity
                        className="flex-1 bg-gray-100 dark:bg-slate-800 py-3 rounded-xl flex-row justify-center items-center"
                        onPress={handleCopy}
                    >
                        <MaterialCommunityIcons name="content-copy" size={20} color={isDark ? "#e2e8f0" : "#475569"} className="mr-2" />
                        <Text className="font-bold text-slate-700 dark:text-slate-200">Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-primary-500 py-3 rounded-xl flex-row justify-center items-center shadow-sm"
                        onPress={handleExport}
                    >
                        <MaterialCommunityIcons name="export-variant" size={20} color="white" className="mr-2" />
                        <Text className="font-bold text-white">Export</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
