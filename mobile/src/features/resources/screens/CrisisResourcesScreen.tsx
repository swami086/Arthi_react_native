import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MotiView } from 'moti';

export const CrisisResourcesScreen = () => {
    const navigation = useNavigation();

    const emergencyContacts = [
        {
            title: "Emergency Services",
            number: "112",
            description: "National Emergency Number (India)",
            icon: "alert-octagon",
            color: "bg-red-500",
            textColor: "text-red-500"
        },
        {
            title: "Suicide Prevention",
            number: "9152987821",
            description: "iCall Helpline (10 AM to 8 PM, Mon-Sat)",
            icon: "lifebuoy",
            color: "bg-orange-500",
            textColor: "text-orange-500"
        },
        {
            title: "Women's Helpline",
            number: "1091",
            description: "24/7 Helpline for women in distress",
            icon: "human-female-female",
            color: "bg-pink-500",
            textColor: "text-pink-500"
        },
        {
            title: "Kiran Mental Health",
            number: "1800-599-0019",
            description: "24/7 Rehabilitation Helpline",
            icon: "brain",
            color: "bg-blue-500",
            textColor: "text-blue-500"
        }
    ];

    const handleCall = (number: string) => {
        Linking.openURL(`tel:${number}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
            <View className="px-4 py-3 flex-row items-center border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <MaterialCommunityIcons name="arrow-left" size={24} className="text-gray-900 dark:text-white" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">Crisis Resources</Text>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing' }}
                    className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50"
                >
                    <View className="flex-row items-start">
                        <MaterialCommunityIcons name="alert-circle" size={24} className="text-red-600 dark:text-red-400 mt-1 mr-3" />
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">
                                Are you in immediate danger?
                            </Text>
                            <Text className="text-gray-700 dark:text-red-200 leading-5">
                                If you or someone you know is in immediate danger, please call your local emergency services immediately or go to the nearest emergency room.
                            </Text>
                        </View>
                    </View>
                </MotiView>

                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Helplines
                </Text>

                {emergencyContacts.map((contact, index) => (
                    <MotiView
                        key={index}
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 100 }}
                        className="mb-4"
                    >
                        <TouchableOpacity
                            onPress={() => handleCall(contact.number)}
                            className="flex-row items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
                        >
                            <View className={`w-12 h-12 ${contact.color} rounded-full items-center justify-center mr-4`}>
                                <MaterialCommunityIcons name={contact.icon as any} size={24} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                    {contact.title}
                                </Text>
                                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    {contact.description}
                                </Text>
                                <Text className={`text-lg font-bold ${contact.textColor}`}>
                                    {contact.number}
                                </Text>
                            </View>
                            <View className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                                <MaterialCommunityIcons name="phone" size={20} className="text-gray-600 dark:text-gray-300" />
                            </View>
                        </TouchableOpacity>
                    </MotiView>
                ))}

                <View className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Text className="text-base font-semibold text-blue-800 dark:text-blue-300 mb-2">
                        Need to talk to someone?
                    </Text>
                    <Text className="text-gray-600 dark:text-blue-200 leading-5">
                        SafeSpace therapists are here to listen, but for immediate crisis support, please use the hotlines listed above. Your safety is our top priority.
                    </Text>
                </View>
                <View className="h-8" />
            </ScrollView>
        </SafeAreaView>
    );
};
