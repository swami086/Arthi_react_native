import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';

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
        <MotiView
            animate={{ scale: 1 }}
            // Redesign card layout with mentor avatar and details
            // Improve shadow and border effects
            className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-card mb-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
        >
            <View className="flex-row items-center">
                <View className="relative">
                    {/* Update avatar styling with border */}
                    <Image
                        source={
                            mentorAvatar
                                ? { uri: mentorAvatar }
                                : { uri: 'https://ui-avatars.com/api/?name=' + mentorName }
                        }
                        className="w-16 h-16 rounded-full border-2 border-primary/20"
                    />
                    <View className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-surface-dark" />
                </View>

                <View className="flex-1 ml-4 justify-center">
                    {/* Enhance text hierarchy for mentor name and expertise */}
                    <Text className="font-bold text-xl text-text-main-light dark:text-text-main-dark mb-1 font-sans leading-tight">
                        {mentorName}
                    </Text>
                    {/* Add specialty tag with refined styling */}
                    <View className="flex-row flex-wrap">
                        <View className="bg-primary/10 px-2 py-1 rounded-md self-start">
                             <Text className="text-primary dark:text-primary-dark text-xs font-bold uppercase tracking-wider">
                                {mentorExpertise || 'Mentor'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Add edit button in top-right corner */}
                {onEdit && (
                    <TouchableOpacity
                        onPress={onEdit}
                        className="absolute top-0 right-0 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-bl-xl"
                    >
                        <MaterialCommunityIcons
                            name="pencil"
                            size={18}
                            color="#30bae8"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </MotiView>
    );
};
