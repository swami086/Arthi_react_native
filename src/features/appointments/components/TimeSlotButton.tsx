import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';

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
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={{ marginBottom: 12, flex: 1, marginHorizontal: 4 }}
        >
            <MotiView
                animate={{
                    backgroundColor: isSelected ? '#30bae8' : (disabled ? '#f8fbfc' : '#ffffff'), // primary vs background-light/surface
                    borderColor: isSelected ? '#30bae8' : (disabled ? '#e2e8f0' : '#e2e8f0'),
                    scale: isSelected ? 1.02 : 1,
                }}
                transition={{ type: 'timing', duration: 200 }}
                // Redesign selected state with full primary background
                // Update unselected state with subtle border and hover effects
                // Update shadow effects: shadow-sm for unselected, shadow-lg for selected
                className={`p-4 rounded-xl border items-center justify-center relative min-h-[90px] ${
                    isSelected
                    ? 'shadow-lg shadow-primary/30'
                    : disabled
                        ? 'opacity-50'
                        : 'shadow-sm dark:bg-surface-dark dark:border-gray-700'
                }`}
            >
                {/* Add check circle icon in top-right corner when selected */}
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
                    // Enhance text hierarchy: larger time text
                    className={`font-bold text-lg mb-1 font-sans ${
                        isSelected
                        ? 'text-white'
                        : disabled
                            ? 'text-text-sub-light dark:text-text-sub-dark'
                            : 'text-text-main-light dark:text-text-main-dark'
                    }`}
                >
                    {time}
                </Text>
                <Text
                    // Smaller duration text
                    className={`text-xs font-medium ${
                        isSelected
                        ? 'text-white/80'
                        : 'text-text-sub-light dark:text-text-sub-dark'
                    }`}
                >
                    {duration}
                </Text>
            </MotiView>
        </Pressable>
    );
};
