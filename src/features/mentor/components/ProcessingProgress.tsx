import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ProcessingProgressProps {
  progress: number;
  step: 'uploading' | 'transcribing' | 'generating' | 'completed';
  onCancel?: () => void;
}

const steps = [
  { id: 'uploading', label: 'Uploading Audio', threshold: 0 },
  { id: 'transcribing', label: 'Transcribing Session', threshold: 33 },
  { id: 'generating', label: 'Generating SOAP Note', threshold: 66 },
];

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ progress, step, onCancel }) => {
  // Determine active step index
  const stepIndex = steps.findIndex(s => s.id === step);
  const isCompleted = step === 'completed';

  return (
    <View className="py-6 px-4 bg-surface rounded-xl border border-gray-700 w-full">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-white">
          {isCompleted ? 'Processing Complete' : 'Processing Session...'}
        </Text>
        {isCompleted ? (
          <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
        ) : (
          <ActivityIndicator size="small" color="#30bae8" />
        )}
      </View>

      {/* Progress Bar Container */}
      <View className="h-2 bg-gray-700 rounded-full mb-6 overflow-hidden">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* Steps List */}
      <View className="mb-6">
        {steps.map((s, idx) => {
          const isActive = s.id === step;
          const isDone = stepIndex > idx || isCompleted;

          return (
            <View key={s.id} className="flex-row items-center mb-3">
              <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${isDone ? 'bg-primary' : isActive ? 'bg-primary/20 border border-primary' : 'bg-gray-700'}`}>
                {isDone ? (
                  <MaterialCommunityIcons name="check" size={14} color="white" />
                ) : isActive ? (
                  <ActivityIndicator size={10} color="#30bae8" />
                ) : (
                  <Text className="text-xs text-gray-400">{idx + 1}</Text>
                )}
              </View>
              <Text className={`${isDone || isActive ? 'text-white' : 'text-gray-500'} font-medium`}>
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>

      {!isCompleted && onCancel && (
        <TouchableOpacity
          onPress={onCancel}
          className="self-center py-2 px-4 rounded-full border border-gray-600"
        >
          <Text className="text-gray-400 text-sm">Cancel Processing</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
