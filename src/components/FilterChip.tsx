import React from 'react';
import { Text, Pressable } from 'react-native';
import { MotiView } from 'moti';

interface FilterChipProps {
    label: string;
    isSelected: boolean;
    onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, isSelected, onPress }) => {
    return (
        <MotiView
            animate={{
                scale: isSelected ? 1.05 : 1,
                backgroundColor: isSelected ? '#30bae8' : '#ffffff',
                borderColor: isSelected ? '#30bae8' : '#e5e7eb',
            }}
            transition={{ type: 'spring', damping: 12 }}
            style={{ marginRight: 8, borderRadius: 9999, borderWidth: 1 }}
        >
            <Pressable
                onPress={onPress}
                className="px-4 py-2"
            >
                <Text
                    className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-600'}`}
                >
                    {label}
                </Text>
            </Pressable>
        </MotiView>
    );
};
