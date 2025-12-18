import React from 'react';
import { Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { useColorScheme } from '../hooks/useColorScheme';

interface FilterChipProps {
    label: string;
    isSelected: boolean;
    onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, isSelected, onPress }) => {
    const { isDark } = useColorScheme();

    return (
        <MotiView
            animate={{
                scale: isSelected ? 1.05 : 1,
                backgroundColor: isSelected ? '#30bae8' : (isDark ? '#1f2937' : '#ffffff'),
                borderColor: isSelected ? '#30bae8' : (isDark ? '#374151' : '#e5e7eb'),
            }}
            transition={{ type: 'spring', damping: 12 }}
            style={{ marginRight: 8, borderRadius: 9999, borderWidth: 1 }}
        >
            <Pressable
                onPress={onPress}
                className="px-4 py-2"
            >
                <Text
                    className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}
                >
                    {label}
                </Text>
            </Pressable>
        </MotiView>
    );
};
