import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';

interface BottomActionBarProps {
    onSecondaryPress: () => void;
    secondaryLabel: string;
    onPrimaryPress: () => void;
    primaryLabel: string;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
    onSecondaryPress,
    secondaryLabel,
    onPrimaryPress,
    primaryLabel
}) => {
    return (
        <MotiView
            from={{ translateY: 100, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-6 py-4 flex-row justify-between items-center pb-8 shadow-lg"
        >
            <TouchableOpacity
                className="flex-1 bg-blue-50 dark:bg-blue-900/30 py-3 rounded-xl mr-3 items-center"
                onPress={onSecondaryPress}
            >
                <Text className="text-primary font-bold text-base">{secondaryLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex-1 bg-primary py-3 rounded-xl ml-3 items-center shadow-md shadow-blue-200"
                onPress={onPrimaryPress}
            >
                <Text className="text-white font-bold text-base">{primaryLabel}</Text>
            </TouchableOpacity>
        </MotiView>
    );
};
