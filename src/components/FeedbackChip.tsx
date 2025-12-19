import React from 'react';
import { Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { useColorScheme } from '../hooks/useColorScheme';

interface FeedbackChipProps {
    label: string;
    isSelected: boolean;
    onPress: () => void;
}

export const FeedbackChip: React.FC<FeedbackChipProps> = ({ label, isSelected, onPress }) => {
    const { isDark } = useColorScheme();

    return (
        <MotiView
            animate={{
                scale: isSelected ? 1.05 : 1,
                backgroundColor: isSelected ? '#30bae8' : (isDark ? '#1f2937' : '#f3f4f6'),
            }}
            transition={{ type: 'spring' }}
            style={{ marginRight: 8, marginBottom: 8, borderRadius: 12 }}
        >
            <Pressable
                onPress={onPress}
                className="px-4 py-2"
            >
                <Text
                    className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}
                >
                    {label}
                </Text>
            </Pressable>
        </MotiView>
    );
};
