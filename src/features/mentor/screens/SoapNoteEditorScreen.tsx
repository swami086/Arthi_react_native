import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/types';
import { useSoapNote } from '../hooks/useSoapNote';
import { SoapSection } from '../../../components/SoapSection';
import { AutoSaveIndicator } from '../../../components/AutoSaveIndicator';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type SoapNoteEditorRouteProp = RouteProp<RootStackParamList, 'SoapNoteEditor'>;

export const SoapNoteEditorScreen = () => {
  const route = useRoute<SoapNoteEditorRouteProp>();
  const navigation = useNavigation();
  const { soapNoteId, appointmentId, transcriptId } = route.params;

  const { generateSoapNote, updateSoapNote, finalizeSoapNote, soapNote, isGenerating, error } = useSoapNote();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    subjective: true,
    objective: true,
    assessment: true,
    plan: true,
  });

  const [localNote, setLocalNote] = useState<any>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeNote();
  }, [soapNoteId]);

  useEffect(() => {
    if (soapNote) {
      setLocalNote({
        subjective: soapNote.subjective || '',
        objective: soapNote.objective || '',
        assessment: soapNote.assessment || '',
        plan: soapNote.plan || '',
      });
      if (soapNote.updated_at) {
        setLastSaved(new Date(soapNote.updated_at));
      }
    }
  }, [soapNote]);

  const initializeNote = async () => {
    // If we have a transcriptId and it's a new note, we might want to trigger generation
    if (transcriptId && !soapNote) {
      await generateSoapNote(transcriptId, appointmentId);
    }
    // Otherwise the hook might handle fetching if we modified it to fetch by ID
    // For this prototype, we rely on the hook's state or the passed params if we had passed full object
  };

  const handleTextChange = (section: string, text: string) => {
    setLocalNote((prev: any) => ({ ...prev, [section]: text }));
    triggerAutoSave(section, text);
  };

  const triggerAutoSave = (section: string, text: string) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setAutoSaveStatus('idle');

    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      const result = await updateSoapNote(soapNoteId, { [section]: text });
      if (result) {
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
      } else {
        setAutoSaveStatus('error');
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFinalize = async () => {
    // Validate
    const sections = ['subjective', 'objective', 'assessment', 'plan'];
    const emptySections = sections.filter(s => localNote[s].trim().length < 50);

    if (emptySections.length > 0) {
      Alert.alert(
        'Validation Error',
        `The following sections are too short (min 50 chars): ${emptySections.join(', ')}`
      );
      return;
    }

    Alert.alert(
      'Finalize SOAP Note',
      'Are you sure you want to finalize this note? You will not be able to edit it afterwards.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finalize',
          style: 'destructive',
          onPress: async () => {
            const success = await finalizeSoapNote(soapNoteId);
            if (success) {
              Alert.alert('Success', 'SOAP Note finalized successfully');
              navigation.goBack();
            } else {
              Alert.alert('Error', 'Failed to finalize note');
            }
          }
        }
      ]
    );
  };

  const handleRegenerate = () => {
    Alert.alert(
      'Regenerate Note',
      'This will overwrite your current edits. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            if (transcriptId) {
              await generateSoapNote(transcriptId, appointmentId);
            } else {
              Alert.alert('Error', 'Cannot regenerate without transcript ID');
            }
          }
        }
      ]
    );
  };

  const handleExportPDF = async () => {
    try {
      const content = `
        SOAP NOTE
        Date: ${new Date().toLocaleDateString()}

        SUBJECTIVE:
        ${localNote.subjective}

        OBJECTIVE:
        ${localNote.objective}

        ASSESSMENT:
        ${localNote.assessment}

        PLAN:
        ${localNote.plan}
      `;

      const fileUri = FileSystem.documentDirectory + `soap_note_${soapNoteId}.txt`; // Using txt for simplicity in prototype
      await FileSystem.writeAsStringAsync(fileUri, content);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to export');
    }
  };

  if (isGenerating) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#30bae8" />
        <Text className="text-white text-lg mt-4 font-bold">Generating SOAP Note...</Text>
        <Text className="text-gray-400 mt-2 text-center px-8">
          Analyzing transcript with GPT-4o to extract clinical insights.
        </Text>
      </SafeAreaView>
    );
  }

  const isFinalized = soapNote?.is_finalized || false;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800 bg-surface">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#e0e6e8" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-lg font-bold text-white">SOAP Note</Text>
          <View className={`px-2 py-0.5 rounded-full mt-1 ${isFinalized ? 'bg-green-900/50 border border-green-700' : 'bg-amber-900/50 border border-amber-700'}`}>
            <Text className={`text-xs font-bold ${isFinalized ? 'text-green-400' : 'text-amber-400'}`}>
              {isFinalized ? 'FINALIZED' : 'DRAFT'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleExportPDF} className="p-2">
          <MaterialCommunityIcons name="export-variant" size={24} color="#30bae8" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 py-4">
          <View className="mb-4 flex-row justify-between items-center">
             <Text className="text-gray-400 text-sm">
               {soapNote?.edited_by_mentor ? 'Edited by mentor' : 'AI Generated Draft'}
             </Text>
             <AutoSaveIndicator status={autoSaveStatus} lastSaved={lastSaved} />
          </View>

          <SoapSection
            id="S"
            title="Subjective"
            icon="account-voice"
            value={localNote.subjective}
            onChangeText={(text) => handleTextChange('subjective', text)}
            isExpanded={expandedSections.subjective}
            onToggle={() => toggleSection('subjective')}
            isReadOnly={isFinalized}
            placeholder="Patient's reported experience, symptoms, and history..."
          />

          <SoapSection
            id="O"
            title="Objective"
            icon="eye-outline"
            value={localNote.objective}
            onChangeText={(text) => handleTextChange('objective', text)}
            isExpanded={expandedSections.objective}
            onToggle={() => toggleSection('objective')}
            isReadOnly={isFinalized}
            placeholder="Therapist's observations, appearance, affect, behavior..."
          />

          <SoapSection
            id="A"
            title="Assessment"
            icon="brain"
            value={localNote.assessment}
            onChangeText={(text) => handleTextChange('assessment', text)}
            isExpanded={expandedSections.assessment}
            onToggle={() => toggleSection('assessment')}
            isReadOnly={isFinalized}
            placeholder="Clinical impression, diagnosis, progress towards goals..."
          />

          <SoapSection
            id="P"
            title="Plan"
            icon="clipboard-list-outline"
            value={localNote.plan}
            onChangeText={(text) => handleTextChange('plan', text)}
            isExpanded={expandedSections.plan}
            onToggle={() => toggleSection('plan')}
            isReadOnly={isFinalized}
            placeholder="Treatment plan, homework, next session goals..."
          />

          <View className="h-24" />
        </ScrollView>

        {/* Bottom Actions */}
        {!isFinalized && (
          <View className="p-4 bg-surface border-t border-gray-800">
            <View className="flex-row space-x-4 gap-4">
              <TouchableOpacity
                onPress={handleRegenerate}
                className="flex-1 bg-surface border border-gray-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-bold">Regenerate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFinalize}
                className="flex-1 bg-primary py-3 rounded-lg items-center shadow-lg shadow-cyan-900/20"
              >
                <Text className="text-white font-bold">Finalize Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
