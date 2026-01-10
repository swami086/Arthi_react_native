import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const PatientOnboardingScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { patientId } = route.params || {};

    // Mock steps
    const steps = [
        { id: '1', title: 'Initial Assessment', desc: 'Complete the baseline skills assessment', icon: 'clipboard-list-outline', done: false },
        { id: '2', title: 'Set Goals', desc: 'Define short-term and long-term goals', icon: 'flag-checkered', done: false, action: 'AddGoal' },
        { id: '3', title: 'Schedule Kick-off', desc: 'Book the first therapisting session', icon: 'calendar-clock', done: false, action: 'Sessions' },
        { id: '4', title: 'Learning Path', desc: 'Assign reading materials or courses', icon: 'school-outline', done: false },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-6 py-4 flex-row items-center bg-white dark:bg-gray-800 shadow-sm z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <Icon name="arrow-left" size={24} color="#4e8597" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text-main-light dark:text-white">Onboarding Checklist</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                    <Text className="text-blue-800 dark:text-blue-300">
                        Use this checklist to ensure you cover all basics when starting with a new patient.
                    </Text>
                </View>

                {steps.map((step, index) => (
                    <TouchableOpacity
                        key={step.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 shadow-sm flex-row items-center"
                        onPress={() => {
                            if (step.action === 'AddGoal' && patientId) {
                                navigation.navigate('AddGoal', { patientId });
                            } else if (step.action === 'Sessions') {
                                navigation.navigate('Sessions'); // Or specific booking flow
                            }
                        }}
                    >
                        <View className={`h-10 w-10 rounded-full items-center justify-center mr-4 ${step.done ? 'bg-green-100' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <Icon name={step.done ? "check" : step.icon} size={20} color={step.done ? "green" : "#666"} />
                        </View>
                        <View className="flex-1">
                            <Text className={`text-lg font-bold ${step.done ? 'text-gray-400 line-through' : 'text-text-main-light dark:text-white'}`}>{step.title}</Text>
                            <Text className="text-sm text-text-sub-light dark:text-gray-400">{step.desc}</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color="#ccc" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};
