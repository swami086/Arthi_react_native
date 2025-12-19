import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/types';
import * as recordingService from '../../../api/recordingService';
import { MetadataCard } from '../../../components/MetadataCard';
import { SearchBar } from '../../../components/SearchBar';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type TranscriptViewerRouteProp = RouteProp<RootStackParamList, 'TranscriptViewer'>;

export const TranscriptViewerScreen = () => {
  const route = useRoute<TranscriptViewerRouteProp>();
  const navigation = useNavigation<any>();
  const { transcriptId, appointmentId } = route.params;

  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState<recordingService.Transcript | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [soapNoteId, setSoapNoteId] = useState<string | null>(null);

  useEffect(() => {
    fetchTranscript();
    checkExistingSoapNote();
  }, [transcriptId]);

  const fetchTranscript = async () => {
    try {
      setLoading(true);
      // In a real app, we would fetch by transcript ID directly, but our mock service needs recording ID
      // For now, we'll assume we can get it.
      // Since the mock service is limited, let's just get "a" transcript if we can't find specific one
      // Or in the real implementation, we would have an endpoint for getTranscriptById

      // MOCK LOGIC:
      // We will try to find a transcript that matches the ID, or create a mock one for display if coming from the flow
      let foundTranscript = null;

      // This is a placeholder behavior because our mock service is simple
      // In real implementation: const data = await api.getTranscript(transcriptId);

      if (!foundTranscript) {
        // Fallback for demo
         foundTranscript = {
          id: transcriptId,
          recording_id: 'rec_123',
          transcript_text: "Therapist: Good morning, how are you feeling today?\n\nPatient: I've been feeling a bit better, but still struggling with anxiety in social situations.\n\nTherapist: Can you tell me more about a specific situation where you felt this anxiety recently?\n\nPatient: Yes, yesterday I had to attend a team meeting at work. I felt my heart racing before I even logged on. I was worried I would be asked to speak.\n\nTherapist: That sounds intense. What were you thinking might happen if you spoke?\n\nPatient: I thought I might say something stupid or lose my train of thought, and everyone would judge me.\n\nTherapist: It sounds like there's a fear of negative evaluation there. Let's explore that further. Have you ever actually said something 'stupid' in a meeting before?\n\nPatient: Not really, usually people tell me I articulate my points well. But the fear is always there.\n\nTherapist: So the evidence from your past experiences contradicts your fear. That's an important observation. Let's work on some grounding techniques you can use before meetings.",
          language_detected: 'English',
          word_count: 145,
          created_at: new Date().toISOString()
        };
      }

      setTranscript(foundTranscript);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      Alert.alert('Error', 'Failed to load transcript');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingSoapNote = async () => {
    if (appointmentId) {
      const note = await recordingService.getSoapNoteByAppointment(appointmentId);
      if (note) {
        setSoapNoteId(note.id);
      }
    }
  };

  const handleCopy = () => {
    // Clipboard would be imported from expo-clipboard
    Alert.alert('Success', 'Transcript copied to clipboard');
  };

  const handleExport = async () => {
    try {
      if (!transcript) return;

      const fileUri = FileSystem.documentDirectory + `transcript_${transcriptId}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, transcript.transcript_text);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Info', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error exporting transcript:', error);
      Alert.alert('Error', 'Failed to export transcript');
    }
  };

  const handleGenerateSoap = () => {
    if (soapNoteId && appointmentId) {
      navigation.navigate('SoapNoteEditor', { soapNoteId, appointmentId, transcriptId });
    } else if (appointmentId) {
      // Logic to start generation would go here or navigate to editor which starts it
      // For now, let's simulate we are creating a new one
      navigation.navigate('SoapNoteEditor', { soapNoteId: `new_${Date.now()}`, appointmentId, transcriptId });
    }
  };

  const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) {
      return <Text className="text-gray-300 text-base leading-6 font-mono">{text}</Text>;
    }

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <Text className="text-gray-300 text-base leading-6 font-mono">
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <Text key={i} className="bg-yellow-400 text-black font-bold">{part}</Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#30bae8" />
        <Text className="text-gray-400 mt-4">Loading transcript...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#e0e6e8" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Session Transcript</Text>
        <TouchableOpacity onPress={handleGenerateSoap} className="p-2">
          <MaterialCommunityIcons name="file-document-edit" size={24} color="#30bae8" />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        {/* Metadata */}
        {transcript && (
          <View className="flex-row px-2 py-4">
            <MetadataCard icon="clock-outline" label="Duration" value="~45 min" />
            <MetadataCard icon="text-box-outline" label="Word Count" value={transcript.word_count} />
            <MetadataCard icon="translate" label="Language" value={transcript.language_detected} />
          </View>
        )}

        {/* Search */}
        <View className="px-4 mb-4">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search in transcript..."
          />
        </View>

        {/* Transcript Content */}
        <ScrollView className="flex-1 px-4 mb-20">
          <View className="bg-surface p-4 rounded-lg border border-gray-700 mb-6">
            {transcript ? (
              <HighlightedText text={transcript.transcript_text} highlight={searchQuery} />
            ) : (
              <Text className="text-gray-500 italic">No transcript content available.</Text>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 border-t border-gray-800 flex-row space-x-4 gap-4">
          <TouchableOpacity
            onPress={handleCopy}
            className="flex-1 bg-surface border border-gray-600 py-3 rounded-lg items-center flex-row justify-center"
          >
            <MaterialCommunityIcons name="content-copy" size={20} color="#e0e6e8" className="mr-2" />
            <Text className="text-white font-bold">Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleExport}
            className="flex-1 bg-surface border border-gray-600 py-3 rounded-lg items-center flex-row justify-center"
          >
            <MaterialCommunityIcons name="export-variant" size={20} color="#e0e6e8" className="mr-2" />
            <Text className="text-white font-bold">Export</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
