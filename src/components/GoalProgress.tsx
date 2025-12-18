import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';

interface GoalProgressProps {
    title: string;
    percentage: number;
    color?: string;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ title, percentage, color = '#30bae8' }) => {
    return (
        <View className="mb-4">
            <View className="flex-row justify-between mb-1">
                <Text className="text-gray-700 font-bold text-sm">{title}</Text>
                <Text className="text-gray-500 text-xs font-bold">{percentage}%</Text>
            </View>
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <MotiView
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    style={{
                        backgroundColor: color,
                        height: '100%',
                        borderRadius: 4
                    }}
                />
            </View>
        </View>
    );
};
