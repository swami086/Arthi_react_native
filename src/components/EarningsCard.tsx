import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EarningsCardProps {
    title: string;
    amount: number;
    currency?: string;
    trend?: number; // percentage
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    delay?: number;
}

export const EarningsCard: React.FC<EarningsCardProps> = ({
    title,
    amount,
    currency = '₹',
    trend,
    icon,
    color,
    delay = 0
}) => {
    const isPositive = trend && trend >= 0;

    return (
        <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm w-40 mr-4 border border-gray-100 dark:border-gray-700"
        >
            <View className={`w-10 h-10 rounded-full items-center justify-center mb-3`} style={{ backgroundColor: `${color}20` }}>
                <MaterialCommunityIcons name={icon} size={20} color={color} />
            </View>

            <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
                {title}
            </Text>

            <Text className="text-gray-900 dark:text-white text-xl font-bold mb-2">
                {currency}{amount.toLocaleString()}
            </Text>

            {trend !== undefined && (
                <View className="flex-row items-center">
                    <MaterialCommunityIcons
                        name={isPositive ? "arrow-up" : "arrow-down"}
                        size={12}
                        color={isPositive ? "#16a34a" : "#dc2626"}
                    />
                    <Text className={`text-xs font-medium ml-0.5 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(trend)}%
                    </Text>
                    <Text className="text-gray-400 text-xs ml-1">vs last mo</Text>
                </View>
            )}
        </MotiView>
    );
};
