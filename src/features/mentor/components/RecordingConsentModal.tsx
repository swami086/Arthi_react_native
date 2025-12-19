import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RecordingConsentModalProps {
  visible: boolean;
  onClose: () => void;
  onLearnMore?: () => void;
}

const InfoSection = ({ icon, title, content, bulletPoints }: { icon: string; title: string; content: string; bulletPoints: string[] }) => (
  <View className="mb-6 bg-surface p-4 rounded-xl border border-gray-700">
    <View className="flex-row items-center mb-2">
      <MaterialCommunityIcons name={icon as any} size={24} color="#30bae8" />
      <Text className="text-lg font-bold text-white ml-2">{title}</Text>
    </View>
    <Text className="text-gray-300 mb-2 leading-5">{content}</Text>
    <View className="ml-2">
      {bulletPoints.map((point, index) => (
        <View key={index} className="flex-row items-start mb-1">
          <Text className="text-primary mr-2">•</Text>
          <Text className="text-gray-400 text-sm">{point}</Text>
        </View>
      ))}
    </View>
  </View>
);

export const RecordingConsentModal: React.FC<RecordingConsentModalProps> = ({ visible, onClose, onLearnMore }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row justify-between items-center p-4 border-b border-gray-800">
          <Text className="text-xl font-bold text-white">Recording & Privacy</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="close" size={24} color="#9ba8ae" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <InfoSection
            icon="microphone"
            title="What We Record"
            content="Audio recording of your therapy session for clinical documentation purposes."
            bulletPoints={[
              "Session audio only (no video)",
              "Encrypted storage",
              "Secure transmission"
            ]}
          />

          <InfoSection
            icon="cog"
            title="How We Process Your Data"
            content="Your recording is processed using AI for transcription and clinical note generation."
            bulletPoints={[
              "OpenAI Whisper for transcription",
              "GPT-4o for SOAP note generation",
              "Zero data retention policy enabled on AI processors"
            ]}
          />

          <InfoSection
            icon="database"
            title="Where We Store Your Data"
            content="All data is stored securely in AWS Mumbai region (DPDP compliant)."
            bulletPoints={[
              "Encrypted at rest",
              "Encrypted in transit (HTTPS)",
              "Regular backups"
            ]}
          />

          <InfoSection
            icon="shield-check"
            title="Your Rights Under DPDP Act 2023"
            content="You have the right to access, correct, and delete your data."
            bulletPoints={[
              "Right to access recordings",
              "Right to request deletion",
              "Right to data portability"
            ]}
          />

          <InfoSection
            icon="calendar-clock"
            title="Data Retention"
            content="Recordings are retained for 1 year from the session date."
            bulletPoints={[
              "Automatic deletion after 1 year",
              "Manual deletion available anytime",
              "Compliant with DPDP guidelines"
            ]}
          />

          <View className="h-8" />
        </ScrollView>

        <View className="p-4 border-t border-gray-800 bg-background">
          {onLearnMore && (
            <TouchableOpacity onPress={onLearnMore} className="items-center mb-4">
              <Text className="text-primary font-medium">Learn More (Privacy Policy)</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onClose}
            className="bg-primary py-3 rounded-full items-center shadow-lg shadow-cyan-900/20"
          >
            <Text className="text-white font-bold text-base">I Understand</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
