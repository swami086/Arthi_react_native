import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AppointmentSummaryCardProps {
    mentorName: string;
    mentorAvatar?: string;
    mentorExpertise?: string;
    onEdit?: () => void;
}

export const AppointmentSummaryCard: React.FC<AppointmentSummaryCardProps> = ({
    mentorName,
    mentorAvatar,
    mentorExpertise,
    onEdit
}) => {
    return (
        <View className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-4 border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center">
                <Image
                    source={
                        mentorAvatar
                            ? { uri: mentorAvatar }
                            : { uri: 'https://ui-avatars.com/api/?name=' + mentorName }
                    }
                    className="w-12 h-12 rounded-full mr-3"
                />
                <View className="flex-1">
                    <Text className="font-bold text-lg text-gray-900 dark:text-white">
                        {mentorName}
                    </Text>
                    {mentorExpertise && (
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">
                            {mentorExpertise}
                        </Text>
                    )}
                </View>
                {onEdit && (
                    <TouchableOpacity onPress={onEdit} className="p-2">
                        <MaterialCommunityIcons
                            name="pencil"
                            size={20}
                            color="#30bae8"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};
