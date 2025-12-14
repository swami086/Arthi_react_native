import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/Button';
import { PageIndicator } from '../components/PageIndicator';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { OnboardingNavigationProp } from '../../../navigation/types';

export const FeaturesScreen = () => {
    const navigation = useNavigation<OnboardingNavigationProp>();

    const FeatureCard = ({ icon, title, desc }: any) => (
        <View className="flex-row items-center bg-white dark:bg-gray-800 p-4 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <View className="w-12 h-12 bg-blue-50 dark:bg-gray-700 rounded-full items-center justify-center mr-4">
                <Icon name={icon} size={24} color="#30bae8" />
            </View>
            <View className="flex-1">
                <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-1">{title}</Text>
                <Text className="text-text-sub-light dark:text-text-sub-dark text-sm leading-5">{desc}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark justify-between p-6">
            <View>
                <View className="flex-row justify-between items-center mb-6">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color="#4e8597" />
                    </TouchableOpacity>
                </View>

                <Text className="text-3xl font-display font-bold mb-2 text-text-main-light dark:text-text-main-dark">
                    How it Works
                </Text>
                <Text className="text-text-sub-light dark:text-text-sub-dark text-base mb-8">
                    Simple steps to get the support you need.
                </Text>

                <FeatureCard
                    icon="groups" // diversity_3
                    title="Connect with Mentors"
                    desc="Find experienced mentors who share your background and interests."
                />
                <FeatureCard
                    icon="calendar-today" // calendar_month
                    title="Easy Scheduling"
                    desc="Book appointments that fit your schedule seamlessly."
                />
                <FeatureCard
                    icon="chat-bubble-outline" // chat_bubble
                    title="Safe Chat"
                    desc="Secure, private messaging to stay in touch with your mentor."
                />
            </View>

            <View>
                <View className="mb-8">
                    <PageIndicator totalPages={3} currentPage={1} />
                </View>
                <View className="flex-row space-x-4">
                    <View className="flex-1">
                        <Button
                            title="Back"
                            onPress={() => navigation.goBack()}
                            variant="outline"
                        />
                    </View>
                    <View className="flex-1">
                        <Button title="Next" onPress={() => navigation.navigate('Safety')} />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};
