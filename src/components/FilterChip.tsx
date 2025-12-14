import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface FilterChipProps {
    label: string;
    isSelected: boolean;
    onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, isSelected, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`px-4 py-2 rounded-full mr-2 border ${isSelected
                    ? 'bg-primary border-primary'
                    : 'bg-white border-gray-200'
                }`}
        >
            <Text
                className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-600'
                    }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};
