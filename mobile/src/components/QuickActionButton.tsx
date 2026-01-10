import React, { useState } from 'react';
import { Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { tokens } from '../design-system/tokens';

interface QuickActionButtonProps {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    color: string;
    onPress: () => void;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, color, onPress }) => {
    const [pressed, setPressed] = useState(false);

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            className="mr-6 items-center"
        >
            <MotiView
                animate={{
                    scale: pressed ? 0.95 : 1,
                    rotate: pressed ? '10deg' : '0deg',
                    shadowOpacity: pressed ? 0.3 : 0.1
                }}
                transition={{ type: 'spring', damping: 10 }}
                className={`w-14 h-14 rounded-full items-center justify-center mb-2 shadow-soft`}
                style={{ backgroundColor: color }}
            >
                <MaterialCommunityIcons name={icon} size={tokens.dimensions.icon.xl} color={tokens.colors.surface.light} />
            </MotiView>
            <Text className="text-text-secondary dark:text-text-secondary-dark text-xs font-bold text-center font-primary">{label}</Text>
        </Pressable>
    );
};
