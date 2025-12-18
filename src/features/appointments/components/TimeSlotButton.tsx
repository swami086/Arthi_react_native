import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TimeSlotButtonProps {
    time: string;
    duration?: string;
    isSelected: boolean;
    onPress: () => void;
    disabled?: boolean;
}

export const TimeSlotButton: React.FC<TimeSlotButtonProps> = ({
    time,
    duration = "45 min",
    isSelected,
    onPress,
    disabled
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className={`p-3 rounded-xl border mb-3 justify-center items-center h-20 shadow-sm ${isSelected
                ? 'bg-primary border-primary'
                : disabled
                    ? 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-700 opacity-50'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                }`}
        >
            <Text
                className={`font-bold text-base mb-1 ${isSelected ? 'text-white' : disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white'
                    }`}
            >
                {time}
            </Text>
            <Text
                className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-400 dark:text-gray-400'
                    }`}
            >
                {duration}
            </Text>
        </TouchableOpacity>
    );
};
