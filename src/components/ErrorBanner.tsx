import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ErrorBannerProps {
    message: string;
    onRetry?: () => void;
    visible: boolean;
    onClose?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry, visible, onClose }) => {
    if (!visible) return null;

    return (
        <View className="bg-red-50 p-4 border-b border-red-200 flex-row items-start">
            <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" style={{ marginTop: 2 }} />
            <View className="flex-1 ml-3">
                <Text className="text-red-800 font-bold text-sm mb-1">An error occurred</Text>
                <Text className="text-red-600 text-sm">{message}</Text>
                {onRetry && (
                    <TouchableOpacity onPress={onRetry} className="mt-2 bg-red-100 self-start px-3 py-1 rounded">
                        <Text className="text-red-700 font-bold text-xs">Retry</Text>
                    </TouchableOpacity>
                )}
            </View>
            {onClose && (
                <TouchableOpacity onPress={onClose} className="ml-2">
                    <MaterialCommunityIcons name="close" size={20} color="#EF4444" />
                </TouchableOpacity>
            )}
        </View>
    );
};
