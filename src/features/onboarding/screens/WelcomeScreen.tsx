import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
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

                <View className="mb-8 w-full px-4">
                    <Image
                        source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDy979WXgeT-5fkgq_gEkbTeBGv_JiXwOLLTI7Ngzpfw_Sfq9JYiceSllmrVzutxlRDKSdqMDLl9oPg0EVgQJbDC00tmB-SWVKimBRs-RkV7IlaHY-oybYTpkHkZB2JbfTdXlm5xhp6eHI7bzAj5estAt3zx1-j3ZTP_qfsiEesm2LHZaT3L4ulAay7bFL31jhtkFnXy1zrRT-xIw4PXdGQkN_0SyOegdgqMpd36CvuAhw1K6Q5C2ZwzOxNe2SxBQrsarxf0XmpaQN_" }}
                        className="w-full aspect-[4/3] rounded-xl"
                        resizeMode="cover"
                        accessibilityLabel="Illustration of a young person chatting comfortably with a mentor figure on bean bags"
                    />
                </View>

                {/* Headline */}
                <Text className="text-slate-900 dark:text-white tracking-tight text-[32px] font-extrabold leading-tight text-center pb-3">
                    Mentoring, <Text className="text-secondary dark:text-secondary-400">Not Therapy</Text>
                </Text>

                {/* Body Text */}
                <Text className="text-slate-600 dark:text-slate-300 text-base font-medium leading-relaxed text-center max-w-[320px]">
                    Life can be overwhelmed. We provide a judgment-free zone where you can talk to real mentors and build skills for the future.
                </Text>
            </View>

            {/* Footer */}
            <View className="w-full px-6 pb-8 pt-2 flex flex-col gap-6">
                <PageIndicator totalPages={3} currentPage={0} activeColor="bg-secondary" />

                <Button
                    onPress={() => navigation.navigate('Features')}
                    className="w-full h-14 bg-secondary shadow-secondary/30"
                    variant="primary"
                    icon="arrow-forward"
                    iconPosition="right"
                    title="Next"
                />
            </View>
        </SafeAreaView>
    );
};
