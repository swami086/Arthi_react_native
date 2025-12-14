import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/Button';
import { PageIndicator } from '../components/PageIndicator';
import { setOnboardingCompleted } from '../../../utils/helpers';
import { OnboardingNavigationProp } from '../../../navigation/types';

export const WelcomeScreen = () => {
    const navigation = useNavigation<OnboardingNavigationProp>();

    const handleSkip = async () => {
        await setOnboardingCompleted();
        navigation.navigate('Auth', { screen: 'Login' });
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark justify-between p-6">
            <View>
                <TouchableOpacity
                    className="self-end py-2 px-4 active:opacity-70"
                    onPress={handleSkip}
                >
                    <Text className="text-text-sub-light dark:text-text-sub-dark font-medium text-base">Skip</Text>
                </TouchableOpacity>

                <View className="items-center mt-6">
                    <View className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-800 rounded-3xl mb-8 items-center justify-center overflow-hidden">
                        <Text className="text-gray-400">Onboarding Illustration</Text>
                    </View>

                    <Text className="text-3xl font-display font-bold text-center text-text-main-light dark:text-text-main-dark mb-4">
                        Mentoring, Not Therapy
                    </Text>

                    <Text className="text-center text-text-sub-light dark:text-text-sub-dark text-lg leading-7 px-2">
                        Connect with mentors who share your experience. A safe space for guidance, support, and growth.
                    </Text>
                </View>
            </View>

            <View>
                <View className="mb-8">
                    <PageIndicator totalPages={3} currentPage={0} />
                </View>
                <Button title="Next" onPress={() => navigation.navigate('Features')} />
            </View>
        </SafeAreaView>
    );
};
