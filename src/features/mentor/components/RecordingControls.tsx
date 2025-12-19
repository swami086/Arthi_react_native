import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WaveformVisualizer } from './WaveformVisualizer';

interface RecordingControlsProps {
  recordingState: 'idle' | 'recording' | 'paused' | 'processing' | 'completed';
  duration: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  metering?: number;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  recordingState,
  duration,
  onStart,
  onPause,
  onResume,
  onStop,
  metering = -160,
}) => {
  if (recordingState === 'idle') {
    return (
      <View className="items-center py-4">
        <TouchableOpacity
          onPress={onStart}
          className="w-16 h-16 rounded-full bg-gray-700 items-center justify-center mb-2 shadow-lg"
        >
          <MaterialCommunityIcons name="microphone" size={32} color="white" />
        </TouchableOpacity>
        <Text className="text-gray-400 font-medium">Start Recording</Text>
      </View>
    );
  }

  return (
    <View className="py-4">
      {/* Waveform Visualization */}
      <View className="h-12 mb-4 justify-center items-center">
        {recordingState === 'recording' ? (
          <WaveformVisualizer isRecording={true} metering={metering} />
        ) : (
          <Text className="text-amber-500 font-medium tracking-widest text-lg">PAUSED</Text>
        )}
      </View>

      {/* Timer */}
      <Text className="text-3xl font-bold text-white text-center mb-6 font-mono">
        {formatDuration(duration)}
      </Text>

      {/* Controls Row */}
      <View className="flex-row justify-center items-center space-x-8 gap-8">
        {/* Pause/Resume Button */}
        {recordingState === 'recording' ? (
          <TouchableOpacity
            onPress={onPause}
            className="w-12 h-12 rounded-full bg-amber-500/20 items-center justify-center border border-amber-500"
          >
            <MaterialCommunityIcons name="pause" size={24} color="#f59e0b" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onResume}
            className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center border border-primary"
          >
            <MaterialCommunityIcons name="play" size={24} color="#30bae8" />
          </TouchableOpacity>
        )}

        {/* Stop Button (Main Action) */}
        <TouchableOpacity
          onPress={onStop}
          className="w-16 h-16 rounded-full bg-red-500 items-center justify-center shadow-lg shadow-red-900/40"
        >
          <View className="w-6 h-6 bg-white rounded-sm" />
        </TouchableOpacity>
      </View>

      <Text className="text-center text-gray-400 mt-4 text-sm">
        {recordingState === 'recording' ? 'Recording in progress...' : 'Recording paused'}
      </Text>
    </View>
  );
};
