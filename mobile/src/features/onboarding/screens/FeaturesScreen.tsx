import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PageIndicator } from '../components/PageIndicator';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { StatusBar } from 'react-native';
import { MotiView } from 'moti';

export const FeaturesScreen = () => {
    const navigation = useNavigation<any>();
    const { isDark } = useColorScheme();

    const features = [
        {
            id: 1,
            icon: 'groups',
            title: 'Connect with Therapists',
            description: 'Real people ready to listen, not just analyze your situation.',
        },
        {
            id: 2,
            icon: 'event',
            title: 'Easy Scheduling',
            description: 'Book a session that fits your school life seamlessly.',
        },
        {
            id: 3,
            icon: 'chat-bubble-outline',
            title: 'Safe Chat',
            description: 'Drop a message whenever you need to be heard instantly.',
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View className="flex-1 w-full max-w-md mx-auto">
                {/* Header */}
                <View className="pt-8 px-6 pb-2 flex flex-col items-center">
                    {/* Add decorative top element */}
                    <View className="w-16 h-1 bg-primary/20 rounded-full mb-8" />
                    <Text className="text-text-main-light dark:text-text-main-dark tracking-tight text-[32px] font-extrabold leading-tight text-center w-full">
                        What to expect
                    </Text>
                    <Text className="text-text-sub-light dark:text-text-sub-dark text-center mt-3 text-base font-medium">
                        Here are the tools available to help you navigate your journey.
                    </Text>
                </View>

                {/* Features List */}
                <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ gap: 16 }}>
                    {features.map((feature, index) => (
                        <MotiView
                            key={feature.id}
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: index * 100 + 300, type: 'timing', duration: 500 }}
                            // Enhance feature cards with hover effects (handled via Pressable or just View styling here)
                            // Add subtle background color on hover: hover:bg-white dark:hover:bg-white/5
                            className="flex-row items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-transparent active:bg-white dark:active:bg-white/10"
                        >
                            {/* Update icon containers: size-14 rounded-full bg-primary/10 */}
                            <View className="flex items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 w-14 h-14 shrink-0">
                                <Icon name={feature.icon} size={28} color="#30bae8" />
                            </View>
                            <View className="flex-1 justify-center py-1 bg-transparent">
                                <Text className="text-text-main-light dark:text-text-main-dark text-lg font-bold leading-tight mb-1">
                                    {feature.title}
                                </Text>
                                <Text className="text-text-sub-light dark:text-text-sub-dark text-sm font-medium leading-relaxed">
                                    {feature.description}
                                </Text>
                            </View>
                        </MotiView>
                    ))}
                </ScrollView>

                {/* Footer */}
                <View className="mt-auto w-full flex flex-col pb-10 px-6 bg-background-light dark:bg-background-dark">
                    <View className="py-6">
                        <PageIndicator totalPages={3} currentPage={1} activeColor="bg-primary" />
                    </View>

                    {/* Refine "Back" and "Next" button layout and styling */}
                    <View className="flex-row items-center justify-between w-full mt-2">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="px-6 py-4"
                        >
                            <Text className="text-text-sub-light dark:text-text-sub-dark font-bold text-base">Back</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Safety')}
                            className="bg-primary flex-row items-center gap-2 px-10 py-4 rounded-full shadow-lg shadow-primary/25"
                        >
                            <Text className="text-white font-bold text-base">Next</Text>
                            <Icon name="arrow-forward" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};
