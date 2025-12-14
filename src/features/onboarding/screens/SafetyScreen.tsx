import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PageIndicator } from '../components/PageIndicator';
import { setOnboardingCompleted } from '../../../utils/helpers';

export const SafetyScreen = () => {
    const navigation = useNavigation<any>();

    const handleGetStarted = async () => {
        await setOnboardingCompleted();
        navigation.navigate('Auth', { screen: 'SignUp' });
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="flex-1 w-full max-w-md mx-auto flex-col">
                <ScrollView className="flex-1 flex flex-col" contentContainerStyle={{ flexGrow: 1 }}>
                    {/* Header Image */}
                    <View className="w-full px-4 pt-4 pb-2">
                        <View className="w-full h-64 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-800">
                            <Image
                                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeii2IgyATXOOrSDdedqXOSd8WlrRVLLL29GRV7d0237RECOVtWzAkg0Ypw1AXqWhrXniFxY_uFCZozdHDdPdmZpah9EdnyjMerN9vZgjUxH9SHD9sfeNcJLVC3rdYNZ4DUX2O3lAiNnrbq2kFfmubOM1OUVfFl2ad8ZOctwADy0kuuOA67OuHZGO8XBOlKHr0ChTkPI_GXPpjmBnAJOS_T96UjVW4qoYwObSCcGtA0nogkBTgwJM4MGrFghDQbFgjuamgFkljSaan" }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                            <View className="absolute inset-0 bg-black/20" />
                        </View>
                    </View>

                    {/* Text Content */}
                    <View className="flex flex-col px-6 pt-4 pb-2 text-center items-center">
                        <Text className="text-text-main-light dark:text-text-main-dark tracking-tight text-[28px] font-extrabold leading-tight text-center">
                            Safe, Secure, & Supported
                        </Text>
                        <Text className="text-text-sub-light dark:text-text-sub-dark text-base font-medium leading-relaxed mt-3 text-center">
                            We are here to listen, but your safety comes first. We've built a space where you can grow without worry.
                        </Text>
                    </View>

                    {/* Features Grid */}
                    <View className="px-4 py-6 w-full">
                        <View className="flex-row gap-4">
                            {/* Crisis Card */}
                            <View className="flex-1 flex flex-col gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4 shadow-sm">
                                <View className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Icon name="local-police" size={24} color="#30bae8" />
                                </View>
                                <View className="flex flex-col gap-1">
                                    <Text className="text-text-main-light dark:text-white text-sm font-bold leading-tight">Crisis Resources</Text>
                                    <Text className="text-text-sub-light dark:text-gray-400 text-xs font-normal leading-normal">
                                        Need help now? Access our resource center 24/7 in the menu.
                                    </Text>
                                </View>
                            </View>

                            {/* Privacy Card */}
                            <View className="flex-1 flex flex-col gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4 shadow-sm">
                                <View className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Icon name="lock" size={24} color="#30bae8" />
                                </View>
                                <View className="flex flex-col gap-1">
                                    <Text className="text-text-main-light dark:text-white text-sm font-bold leading-tight">Privacy Promise</Text>
                                    <Text className="text-text-sub-light dark:text-gray-400 text-xs font-normal leading-normal">
                                        Your chats are private. We use encryption to keep your journey safe.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Disclaimer */}
                    <View className="px-6 pb-2">
                        <Text className="text-text-sub-light dark:text-gray-500 text-xs text-center leading-relaxed">
                            Note: This platform offers coaching and mentoring, not emergency medical services.
                        </Text>
                    </View>
                </ScrollView>

                {/* Footer Navigation */}
                <View className="w-full px-6 py-8 pb-10 flex flex-col gap-6 bg-background-light dark:bg-background-dark">
                    <View className="flex justify-center items-center gap-2">
                        <PageIndicator totalPages={3} currentPage={2} activeColor="bg-primary" />
                    </View>

                    <View className="flex-row items-center gap-4 w-full justify-between">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="flex-1 py-4 px-6 rounded-full"
                        >
                            <Text className="text-text-sub-light dark:text-gray-400 font-bold text-sm text-center">Back</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleGetStarted}
                            className="flex-[2] py-4 px-6 rounded-full bg-primary shadow-lg shadow-primary/30"
                        >
                            <Text className="text-white font-bold text-base text-center">Get Started</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};
