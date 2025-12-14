import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/Button';
import { PageIndicator } from '../components/PageIndicator';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { OnboardingNavigationProp } from '../../../navigation/types';
import { setOnboardingCompleted } from '../../../utils/helpers';

export const SafetyScreen = () => {
    const navigation = useNavigation<OnboardingNavigationProp>();

    const handleGetStarted = async () => {
        await setOnboardingCompleted();
        navigation.navigate('Auth', { screen: 'SignUp' });
    };

    const SafetyCard = ({ icon, title, desc }: any) => (
        <View className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm w-[48%] mb-4 border border-gray-100 dark:border-gray-700 h-32 justify-between">
            <View className="w-8 h-8 bg-primary/10 dark:bg-primary-dark/20 rounded-full items-center justify-center">
                <Icon name={icon} size={18} color="#30bae8" />
            </View>
            <View>
                <Text className="text-sm font-bold text-text-main-light dark:text-text-main-dark mb-1">{title}</Text>
                <Text className="text-text-sub-light dark:text-text-sub-dark text-[10px] leading-3">{desc}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark justify-between p-6">
            <View>
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color="#4e8597" />
                    </TouchableOpacity>
                </View>

                <View className="w-full h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl mb-6 items-center justify-center overflow-hidden">
                    <Text className="text-gray-400">Safety Illustration</Text>
                </View>

                <Text className="text-2xl font-display font-bold mb-4 text-text-main-light dark:text-text-main-dark">
                    Safe, Secure, & Supported
                </Text>

                <View className="flex-row flex-wrap justify-between">
                    <SafetyCard
                        icon="local-police"
                        title="Vetted Mentors"
                        desc="Strict background checks for every mentor."
                    />
                    <SafetyCard
                        icon="lock"
                        title="Encrypted"
                        desc="End-to-end encrypted conversations."
                    />
                    <SafetyCard
                        icon="verified-user"
                        title="Community"
                        desc="A safe environment for everyone."
                    />
                    <SafetyCard
                        icon="support-agent"
                        title="24/7 Support"
                        desc="Access to resources whenever needed."
                    />
                </View>
            </View>

            <View>
                <Text className="text-xs text-text-sub-light dark:text-text-sub-dark text-center mb-4 px-4 italic opacity-70">
                    Note: This platform offers coaching and mentoring, not emergency medical services.
                </Text>

                <View className="mb-4">
                    <PageIndicator totalPages={3} currentPage={2} />
                </View>
                <Button title="Get Started" onPress={handleGetStarted} />
            </View>
        </SafeAreaView>
    );
};
