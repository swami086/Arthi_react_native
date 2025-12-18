import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/Button';
import { PageIndicator } from '../components/PageIndicator';
import { setOnboardingCompleted } from '../../../utils/helpers';
import { OnboardingNavigationProp } from '../../../navigation/types';
import LottieView from 'lottie-react-native';
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

                    {/* @ts-ignore */}
                    <MotiView from={itemVariants.initial} animate={itemVariants.animate} className="mb-8 w-full px-4 items-center">
                        <LottieView
                            source={require('../../../assets/animations/welcome.json')}
                            autoPlay
                            loop
                            style={{ width: '100%', height: 300 }}
                        />
                    </MotiView>

                    {/* Headline */}
                    {/* @ts-ignore */}
                    <MotiText
                        from={itemVariants.initial} animate={itemVariants.animate}
                        className="text-slate-900 dark:text-white tracking-tight text-[32px] font-extrabold leading-tight text-center pb-3"
                    >
                        Mentoring, <Text className="text-secondary dark:text-secondary-400">Not Therapy</Text>
                    </MotiText>

                    {/* Body Text */}
                    {/* @ts-ignore */}
                    {/* Body Text */}
                    {/* @ts-ignore */}
                    <MotiText
                        from={itemVariants.initial} animate={itemVariants.animate}
                        className="text-slate-600 dark:text-slate-300 text-base font-medium leading-relaxed text-center self-center max-w-[320px]"
                    >
                        Life can be overwhelmed. We provide a judgment-free zone where you can talk to real mentors and build skills for the future.
                    </MotiText>
                </View>

                {/* Footer */}
                {/* @ts-ignore */}
                <MotiView from={itemVariants.initial} animate={itemVariants.animate} className="w-full px-6 pb-8 pt-2 flex flex-col gap-6 mt-auto">
                    <PageIndicator totalPages={3} currentPage={0} activeColor="bg-secondary" />

                    <Button
                        onPress={() => navigation.navigate('Features')}
                        className="w-full h-14 bg-secondary shadow-secondary/30"
                        variant="primary"
                        icon="arrow-forward"
                        iconPosition="right"
                        title="Next"
                    />
                </MotiView>
            </MotiView>
        </SafeAreaView>
    );
};
