import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  withSequence
} from 'react-native-reanimated';

interface WaveformVisualizerProps {
  isRecording: boolean;
  metering: number;
}

const Bar = ({ index, isRecording, metering }: { index: number; isRecording: boolean; metering: number }) => {
  const height = useSharedValue(10);

  // Create a pseudo-random height based on index and metering
  // This is a visual simulation since we don't have full FFT data
  useEffect(() => {
    if (isRecording) {
      // Base height + random factor + metering influence
      // Metering is typically -160 to 0 (dB)
      // Normalize metering to 0-1 range roughly
      const normalizedVolume = Math.max(0, (metering + 60) / 60);
      const randomFactor = Math.random() * 20;
      const targetHeight = 10 + (normalizedVolume * 40) + randomFactor;

      height.value = withRepeat(
        withSequence(
          withTiming(targetHeight, { duration: 150 + (index * 10), easing: Easing.linear }),
          withTiming(10, { duration: 150 + (index * 10), easing: Easing.linear })
        ),
        -1,
        true
      );
    } else {
      height.value = withTiming(4, { duration: 300 });
    }
  }, [isRecording, metering, index]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      className="w-1.5 mx-0.5 bg-primary rounded-full opacity-80"
    />
  );
};

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isRecording, metering }) => {
  const bars = Array.from({ length: 15 }, (_, i) => i);

  return (
    <View className="flex-row items-center justify-center h-full">
      {bars.map((i) => (
        <Bar key={i} index={i} isRecording={isRecording} metering={metering} />
      ))}
    </View>
  );
};
