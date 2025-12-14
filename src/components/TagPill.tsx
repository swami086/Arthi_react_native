import React from 'react';
import { View, Text } from 'react-native';

interface TagPillProps {
    label: string;
    color?: 'blue' | 'purple' | 'orange' | 'green' | 'gray';
    className?: string; // For additional styling overrides
}

export const TagPill: React.FC<TagPillProps> = ({ label, color = 'blue', className }) => {
    const getColorStyles = () => {
        switch (color) {
            case 'purple':
                return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' };
            case 'orange':
                return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' };
            case 'green':
                return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' };
            case 'gray':
                return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
            default: // blue
                return { bg: 'bg-blue-50', text: 'text-primary', border: 'border-blue-100' };
        }
    };

    const styles = getColorStyles();

    return (
        <View className={`${styles.bg} ${styles.border} px-2 py-0.5 rounded-full border mr-1 mb-1 ${className}`}>
            <Text className={`${styles.text} text-xs font-medium`}>{label}</Text>
        </View>
    );
};
