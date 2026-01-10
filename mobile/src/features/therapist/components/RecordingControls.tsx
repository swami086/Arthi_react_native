import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
  Easing
} from 'react-native-reanimated';

interface RecordingControlsProps {
  recordingState: 'idle' | 'recording' | 'paused';
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

const WaveformBar = ({ index, metering, isRecording }: { index: number, metering: number, isRecording: boolean }) => {
  const height = useSharedValue(10);

  React.useEffect(() => {
    if (isRecording) {
      // Simulate random waveform based on metering
      // Metering is usually -160 to 0. Normalize to 0-1.
      // But for simplicity, we'll just animate randomly when recording
      const randomHeight = 10 + Math.random() * 30;
      height.value = withTiming(randomHeight, { duration: 100 });
    } else {
      height.value = withTiming(4, { duration: 300 });
    }
  }, [metering, isRecording]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  });

  return (
    <Animated.View
      style={[
        { width: 4, backgroundColor: '#0ea5e9', marginHorizontal: 2, borderRadius: 2 },
        animatedStyle
      ]}
    />
  );
};

const RecordingControls: React.FC<RecordingControlsProps> = ({
  recordingState,
  duration,
  onStart,
  onPause,
  onResume,
  onStop,
  metering = -160,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (recordingState === 'recording') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1);
    }
  }, [recordingState]);

  const animatedRecordButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  return (
    <View className="items-center py-6">
      {/* Timer and Waveform */}
      <View className="h-16 flex-row items-center justify-center mb-6 w-full">
         {recordingState !== 'idle' ? (
           <>
             <View className="flex-row items-end h-10 mr-4">
                {[...Array(10)].map((_, i) => (
                  <WaveformBar key={i} index={i} metering={metering} isRecording={recordingState === 'recording'} />
                ))}
             </View>
             <Text className="text-3xl font-mono font-medium text-slate-800 dark:text-white">
               {formatDuration(duration)}
             </Text>
              <View className="flex-row items-end h-10 ml-4">
                {[...Array(10)].map((_, i) => (
                  <WaveformBar key={i} index={i} metering={metering} isRecording={recordingState === 'recording'} />
                ))}
             </View>
           </>
         ) : (
            <Text className="text-gray-500 dark:text-gray-400">Ready to record</Text>
         )}
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-center space-x-8">
        {recordingState === 'idle' ? (
          <TouchableOpacity
            onPress={onStart}
            className="w-16 h-16 rounded-full bg-red-500 items-center justify-center shadow-lg"
          >
            <MaterialCommunityIcons name="microphone" size={32} color="white" />
          </TouchableOpacity>
        ) : (
          <>
            {/* Stop Button */}
             <TouchableOpacity
              onPress={onStop}
              className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center"
            >
              <MaterialCommunityIcons name="stop" size={24} color={isDark ? 'white' : 'black'} />
            </TouchableOpacity>

            {/* Record/Pause Button */}
            <Animated.View style={animatedRecordButtonStyle}>
              <TouchableOpacity
                onPress={recordingState === 'recording' ? onPause : onResume}
                className={`w-20 h-20 rounded-full items-center justify-center shadow-xl ${
                  recordingState === 'recording' ? 'bg-red-500' : 'bg-amber-500'
                }`}
              >
                 <MaterialCommunityIcons
                    name={recordingState === 'recording' ? 'pause' : 'microphone'}
                    size={36}
                    color="white"
                  />
              </TouchableOpacity>
            </Animated.View>

            {/* Placeholder for symmetry or secondary action */}
             <View className="w-12 h-12" />
          </>
        )}
      </View>

      <Text className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
        {recordingState === 'idle' ? 'Tap to start' :
         recordingState === 'recording' ? 'Recording in progress...' :
         'Recording paused'}
      </Text>
    </View>
  );
};

export default RecordingControls;
