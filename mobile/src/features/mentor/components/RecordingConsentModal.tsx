import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { BlurView } from 'expo-blur';

interface RecordingConsentModalProps {
  visible: boolean;
  onClose: () => void;
  onLearnMore?: () => void;
}

const RecordingConsentModal: React.FC<RecordingConsentModalProps> = ({
  visible,
  onClose,
  onLearnMore,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-slate-900 rounded-t-3xl h-[85%] overflow-hidden">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              Recording & Privacy Information
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={isDark ? '#e0e6e8' : '#111d21'}
              />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 pt-2">

            {/* Section 1: What We Record */}
            <InfoSection
              icon="microphone"
              title="What We Record"
              description="Audio recording of your therapy session for clinical documentation purposes."
              points={[
                "Session audio only (no video)",
                "Encrypted storage",
                "Secure transmission"
              ]}
              isDark={isDark}
            />

            {/* Section 2: How We Process */}
            <InfoSection
              icon="cogs"
              title="How We Process Your Data"
              description="Your recording is processed using AI for transcription and clinical note generation."
              points={[
                "OpenAI Whisper for transcription",
                "GPT-4o for SOAP note generation",
                "Zero data retention policy enabled"
              ]}
              isDark={isDark}
            />

            {/* Section 3: Where We Store */}
            <InfoSection
              icon="database"
              title="Where We Store Your Data"
              description="All data is stored securely in AWS Mumbai region (DPDP compliant)."
              points={[
                "Encrypted at rest",
                "Encrypted in transit (HTTPS)",
                "Regular backups"
              ]}
              isDark={isDark}
            />

            {/* Section 4: Your Rights */}
            <InfoSection
              icon="shield-check"
              title="Your Rights Under DPDP Act 2023"
              description="You have the right to access, correct, and delete your data."
              points={[
                "Right to access recordings",
                "Right to request deletion",
                "Right to data portability"
              ]}
              isDark={isDark}
            />

            {/* Section 5: Retention Policy */}
            <InfoSection
              icon="calendar-clock"
              title="Data Retention"
              description="Recordings are retained for 1 year from the session date."
              points={[
                "Automatic deletion after 1 year",
                "Manual deletion available anytime",
                "Compliant with DPDP guidelines"
              ]}
              isDark={isDark}
            />

            <View className="h-24" />
          </ScrollView>

          {/* Footer */}
          <View className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800">
             {onLearnMore && (
              <TouchableOpacity onPress={onLearnMore} className="mb-4 self-center">
                <Text className="text-primary-500 font-medium">Learn More about Privacy Policy</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onClose}
              className="bg-primary-500 py-3 rounded-xl items-center shadow-md"
            >
              <Text className="text-white font-bold text-lg">I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const InfoSection = ({ icon, title, description, points, isDark }: {
  icon: any,
  title: string,
  description: string,
  points: string[],
  isDark: boolean
}) => (
  <View className="mb-6 bg-gray-50 dark:bg-slate-800 p-4 rounded-xl">
    <View className="flex-row items-center mb-2">
      <View className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
        <MaterialCommunityIcons name={icon} size={24} color="#0ea5e9" />
      </View>
      <Text className="text-lg font-semibold text-slate-800 dark:text-white flex-1">
        {title}
      </Text>
    </View>
    <Text className="text-slate-600 dark:text-slate-300 mb-3 ml-1">
      {description}
    </Text>
    {points.map((point, index) => (
      <View key={index} className="flex-row items-start mb-1 ml-1">
        <MaterialCommunityIcons name="circle-small" size={24} color={isDark ? '#94a3b8' : '#64748b'} />
        <Text className="text-slate-600 dark:text-slate-400 mt-1 flex-1">
          {point}
        </Text>
      </View>
    ))}
  </View>
);

export default RecordingConsentModal;
