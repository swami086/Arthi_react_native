import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/Button';
import { PageIndicator } from '../components/PageIndicator';
import { setOnboardingCompleted } from '../../../utils/helpers';
import { OnboardingNavigationProp } from '../../../navigation/types';
import { MotiView, MotiText } from 'moti';

export const WelcomeScreen = () => {
    const navigation = useNavigation<OnboardingNavigationProp>();

    const handleSkip = async () => {
        await setOnboardingCompleted();
        navigation.navigate('Auth', { screen: 'Login' });
    };

    const containerVariants: any = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
    };

    const itemVariants: any = {
        initial: { opacity: 0, translateY: 30 },
        animate: { opacity: 1, translateY: 0 }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark justify-between p-6">
            {/* @ts-ignore */}
            <MotiView
                className="flex-1"
                from={containerVariants.initial}
                animate={containerVariants.animate}
            >
                <View>
                    <TouchableOpacity
                        className="self-end py-2 px-4 active:opacity-70"
                        onPress={handleSkip}
                    >
                        <Text className="text-text-sub-light dark:text-text-sub-dark font-medium text-base">Skip</Text>
                    </TouchableOpacity>

                    {/* Replace Lottie animation with hero image in rounded container */}
                    {/* @ts-ignore */}
                    <MotiView from={itemVariants.initial} animate={itemVariants.animate} className="mb-8 w-full px-4 items-center mt-4">
                        <View className="w-full aspect-square rounded-[32px] overflow-hidden shadow-2xl shadow-primary/20">
                            <Image
                                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeii2IgyATXOOrSDdedqXOSd8WlrRVLLL29GRV7d0237RECOVtWzAkg0Ypw1AXqWhrXniFxY_uFCZozdHDdPdmZpah9EdnyjMerN9vZgjUxH9SHD9sfeNcJLVC3rdYNZ4DUX2O3lAiNnrbq2kFfmubOM1OUVfFl2ad8ZOctwADy0kuuOA67OuHZGO8XBOlKHr0ChTkPI_GXPpjmBnAJOS_T96UjVW4qoYwObSCcGtA0nogkBTgwJM4MGrFghDQbFgjuamgFkljSaan" }} // Using the image from SafetyScreen or similar placeholder as designed
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                            <View className="absolute inset-0 bg-primary/10" />
                        </View>
                    </MotiView>

                    {/* Headline */}
                    {/* @ts-ignore */}
                    <MotiText
                        from={itemVariants.initial} animate={itemVariants.animate}
                        className="text-text-main-light dark:text-text-main-dark tracking-tight text-[32px] font-extrabold leading-tight text-center pb-3"
                    >
                        Therapisting, <Text className="text-primary dark:text-primary-dark">Not Therapy</Text>
                    </MotiText>

                    {/* Body Text */}
                    {/* @ts-ignore */}
                    <MotiText
                        from={itemVariants.initial} animate={itemVariants.animate}
                        className="text-text-sub-light dark:text-text-sub-dark text-base font-medium leading-relaxed text-center self-center max-w-[320px]"
                    >
                        Life can be overwhelmed. We provide a judgment-free zone where you can talk to real mentors and build skills for the future.
                    </MotiText>
                </View>

                {/* Footer */}
                {/* @ts-ignore */}
                <MotiView from={itemVariants.initial} animate={itemVariants.animate} className="w-full px-6 pb-8 pt-2 flex flex-col gap-6 mt-auto">
                    <PageIndicator totalPages={3} currentPage={0} activeColor="bg-primary" />

                    <Button
                        onPress={() => navigation.navigate('Features')}
                        className="w-full h-14"
                        variant="primary"
                        icon="arrow-right"
                        iconPosition="right"
                        title="Next"
                    />
                </MotiView>
            </MotiView>
        </SafeAreaView>
    );
};
