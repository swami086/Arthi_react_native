import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Shimmer } from 'react-native-fast-shimmer';

import { useColorScheme } from '../hooks/useColorScheme';

interface LoadingSkeletonProps {
    width?: number | string;
    height?: number | string;
    style?: StyleProp<ViewStyle>;
    borderRadius?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    width = '100%',
    height = 20,
    style,
    borderRadius = 4
}) => {
    const { isDark } = useColorScheme();
    const shimmerColors = isDark
        ? ['#374151', '#1f2937', '#374151']
        : ['#E5E7EB', '#F3F4F6', '#E5E7EB'];

    return (
        <MotiView
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ type: 'timing', duration: 1500, loop: true }}
            style={style}
        >
            <Shimmer
                {...({
                    style: [{ width: width as any, height: height as any, borderRadius: borderRadius }, style],
                    shimmerColors: shimmerColors,
                    duration: 1500
                } as any)}
            />
        </MotiView>
    );
};

export const CardSkeleton: React.FC = () => (
    <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm border border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center mb-2">
            <LoadingSkeleton width={40} height={40} borderRadius={20} />
            <View className="ml-3 flex-1">
                <LoadingSkeleton width="60%" height={16} />
                <View className="mt-1" />
                <LoadingSkeleton width="40%" height={12} />
            </View>
        </View>
        <LoadingSkeleton width="100%" height={12} />
    </View>
);

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
    <View>
        {Array.from({ length: count }).map((_, i) => (
            <View key={i}><CardSkeleton /></View>
        ))}
    </View>
);
