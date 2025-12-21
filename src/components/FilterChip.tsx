import React from 'react';
import { Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { useColorScheme } from '../hooks/useColorScheme';
import { tokens } from '../design-system/tokens';

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
                backgroundColor: isSelected ? tokens.colors.primary.light : (isDark ? tokens.colors.background.dark : tokens.colors.background.light),
                borderColor: isSelected ? tokens.colors.primary.light : (isDark ? tokens.colors.border.dark : tokens.colors.border.light),
            }}
            transition={{ type: 'spring', damping: 12 }}
            style={{ marginRight: tokens.spacing[2], borderRadius: 9999, borderWidth: 1 }}
        >
            <Pressable
                onPress={onPress}
                className="px-4 py-2"
            >
                <Text
                    className={`font-semibold text-sm font-primary ${isSelected ? 'text-text-inverse dark:text-text-inverse-dark' : 'text-text-secondary dark:text-text-secondary-dark'}`}
                >
                    {label}
                </Text>
            </Pressable>
        </MotiView>
    );
};
