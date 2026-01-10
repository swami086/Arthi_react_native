import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

interface ProcessingProgressProps {
  progress: number; // 0-100
  status: 'uploading' | 'transcribing' | 'generating' | 'completed';
}

const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ progress, status }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getStatusText = () => {
    switch (status) {
      case 'uploading': return 'Uploading Audio...';
      case 'transcribing': return 'Transcribing Session...';
      case 'generating': return 'Generating SOAP Note...';
      case 'completed': return 'Processing Complete!';
      default: return 'Processing...';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'uploading': return 'cloud-upload';
      case 'transcribing': return 'text-to-speech';
      case 'generating': return 'file-document-edit';
      case 'completed': return 'check-circle';
      default: return 'progress-clock';
    }
  };

  return (
    <View className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 my-4">
      <View className="flex-row items-center mb-3">
        {status === 'completed' ? (
          <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
        ) : (
          <ActivityIndicator color="#0ea5e9" size="small" />
        )}
        <Text className="ml-3 font-semibold text-slate-700 dark:text-slate-200">
          {getStatusText()}
        </Text>
      </View>

      <View className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <View
          className="h-full bg-primary-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>

      <View className="flex-row justify-between mt-2">
         <StepLabel active={status === 'uploading' || progress > 33} label="Upload" />
         <StepLabel active={status === 'transcribing' || progress > 66} label="Transcribe" />
         <StepLabel active={status === 'generating' || progress > 99} label="Generate" />
      </View>
    </View>
  );
};

const StepLabel = ({ active, label }: { active: boolean, label: string }) => (
  <Text className={`text-xs ${active ? 'text-primary-500 font-medium' : 'text-gray-400'}`}>
    {label}
  </Text>
);

export default ProcessingProgress;
