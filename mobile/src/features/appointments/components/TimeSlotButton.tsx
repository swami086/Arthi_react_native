import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { tokens } from '../../../design-system/tokens';

interface TimeSlotButtonProps {
    time: string;
    duration?: string;
    isSelected: boolean;
    onPress: () => void;
    disabled?: boolean;
    onLongPress?: () => void;
}

export const TimeSlotButton: React.FC<TimeSlotButtonProps> = ({
    time,
    duration = "45 min",
    isSelected,
    onPress,
    disabled
}) => {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={{ marginBottom: 12, flex: 1, marginHorizontal: 4 }}
        >
            <MotiView
                animate={{
                    backgroundColor: isSelected ? tokens.colors.primary.light : (disabled ? tokens.colors.background.light : tokens.colors.surface.light),
                    borderColor: isSelected ? tokens.colors.primary.light : tokens.colors.border.light,
                    scale: isSelected ? 1.02 : 1,
                }}
                transition={{ type: 'timing', duration: 200 }}
                className={`p-4 rounded-xl border items-center justify-center relative min-h-[90px] ${isSelected
                    ? 'shadow-elevated'
                    : disabled
                        ? 'opacity-50'
                        : 'shadow-soft dark:bg-surface-dark dark:border-border-dark'
                    }`}
            >
                {isSelected && (
                    <MotiView
                        from={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-2 right-2"
                    >
                        <MaterialCommunityIcons name="check-circle" size={16} color="white" />
                    </MotiView>
                )}

                <Text
                    className={`font-bold text-lg mb-1 font-primary ${isSelected
                        ? 'text-white'
                        : disabled
                            ? 'text-text-secondary dark:text-text-secondary-dark'
                            : 'text-text-primary dark:text-text-primary-dark'
                        }`}
                >
                    {time}
                </Text>
                <Text
                    className={`text-xs font-medium font-primary ${isSelected
                        ? 'text-white/80'
                        : 'text-text-secondary dark:text-text-secondary-dark'
                        }`}
                >
                    {duration}
                </Text>
            </MotiView>
        </Pressable>
    );
};
