import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor: string;
    growth?: string;
    growthLabel?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconColor, growth, growthLabel }) => {
    return (
        <View className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1 mx-1">
            <View className="flex-row justify-between items-start mb-2">
                <View className={`p-2 rounded-xl bg-opacity-10`} style={{ backgroundColor: `${iconColor}20` }}>
                    <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
                </View>
                {growth && (
                    <View className="flex-row items-center bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        <MaterialCommunityIcons name="arrow-top-right" size={12} color="green" />
                        <Text className="text-green-700 dark:text-green-400 text-xs font-bold ml-1">{growth}</Text>
                    </View>
                )}
            </View>
            <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">{title}</Text>
            <Text className="text-gray-900 dark:text-white text-2xl font-bold">{value}</Text>
            {growthLabel && (
                <Text className="text-gray-400 dark:text-gray-500 text-[10px] mt-1">{growthLabel}</Text>
            )}
        </View>
    );
};
