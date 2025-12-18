import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotiView, MotiText } from 'moti';

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

export const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(0);
    const { signIn, signInWithGoogle } = useAuth();
    const { isDark } = useColorScheme();
    const navigation = useNavigation<AuthNavigationProp>();

    const handleLogin = async () => {
        if (!email || !password) {
            triggerError();
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);

        if (error) {
            triggerError();
            Alert.alert('Login Error', error.message);
        }
    };

    const triggerError = () => {
        setShake(prev => prev + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    };

    const containerVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const shakeVariants = {
        initial: { translateX: 0 },
        shake: {
            translateX: [-10, 10, -10, 10, 0],
            transition: { type: 'timing', duration: 100, loop: false }
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View className="flex-1 w-full max-w-md mx-auto">
                {/* Header Back Button (Optional but consistent) */}
                <View className="w-full px-4 pt-6 pb-2 flex-row items-center justify-between z-10">
                    {navigation.canGoBack() ? (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="h-10 w-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm"
                        >
                            <Icon name="arrow-left" size={24} color={isDark ? "#fff" : "#4e8597"} />
                        </TouchableOpacity>
                    ) : (
                        <View className="w-10" />
                    )}
                    <View className="w-10" />
                </View>

                <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
                    <MotiView
                        from={containerVariants.initial}
                        animate={containerVariants.animate as any}
                    >
                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 400, delay: 0 }}
                            className="items-center mb-10"
                        >
                            <MotiView
                                from={{ scale: 0, rotate: '-10deg' }}
                                animate={{ scale: 1, rotate: '3deg' }}
                                transition={{ type: 'spring', damping: 12 }}
                                className="w-24 h-24 bg-primary/10 dark:bg-primary-dark/10 rounded-3xl items-center justify-center mb-6 shadow-sm border border-primary/20"
                            >
                                <Icon name="hand-heart" size={48} color="#30bae8" />
                            </MotiView>

                            <Text className="text-3xl font-display font-bold mb-2 text-text-main-light dark:text-text-main-dark text-center">
                                Welcome Back
                            </Text>
                            <Text className="text-base text-text-sub-light dark:text-text-sub-dark text-center px-4 leading-relaxed">
                                Enter your safe space to continue your journey.
                            </Text>
                        </MotiView>

                        {/* @ts-ignore */}
                        <MotiView
                            animate={shake ? shakeVariants.shake as any : shakeVariants.initial as any}
                            className="space-y-4 w-full"
                        >
                            <Input
                                label="Email Address"
                                placeholder="name@example.com"
                                value={email}
                                onChangeText={setEmail}
                                leftIcon="email"
                                keyboardType="email-address"
                            />

                            <View>
                                <Input
                                    label="Password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    leftIcon="lock"
                                />
                                <TouchableOpacity className="self-end mt-2" onPress={() => console.log('Forgot Password')}>
                                    <Text className="text-primary dark:text-primary-dark font-bold text-sm">Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>

                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing', duration: 400, delay: 200 }}
                                className="mt-8 mb-6"
                            >
                                <Button
                                    title="Log In"
                                    onPress={handleLogin}
                                    loading={loading}
                                    className="shadow-lg shadow-primary/30"
                                    icon="login"
                                    iconPosition="right"
                                />
                            </MotiView>
                        </MotiView>

                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 400, delay: 300 }}
                            className="flex-row items-center mb-6"
                        >
                            <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                            <Text className="mx-4 text-gray-400 font-medium text-xs uppercase tracking-widest">Or</Text>
                            <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        </MotiView>

                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 400, delay: 400 }}
                        >
                            <Button
                                title="Sign in with Google"
                                onPress={signInWithGoogle}
                                variant="outline"
                                icon="google"
                                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm"
                                textClassName="text-text-main-light dark:text-white"
                            />
                        </MotiView>

                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 400, delay: 500 }}
                            className="mt-10 mb-4"
                        >
                            <View className="flex-row justify-center mb-6">
                                <Text className="text-text-sub-light dark:text-text-sub-dark font-medium">Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                    <Text className="text-primary dark:text-primary-dark font-bold">Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        </MotiView>
                    </MotiView>
                </ScrollView>
            </View>
            {loading && (
                <BlurView intensity={20} className="absolute inset-0 items-center justify-center z-50 bg-black/20">
                    {/* Lottie or ActivityIndicator */}
                    <MotiView
                        from={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'timing', duration: 300 }}
                        className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl items-center justify-center"
                    >
                        <MotiView
                            from={{ rotate: '0deg' }}
                            animate={{ rotate: '360deg' }}
                            transition={{ loop: true, repeatReverse: false, type: 'timing', duration: 1000 }}
                        >
                            <Icon name="loading" size={40} color="#30bae8" />
                        </MotiView>
                    </MotiView>
                </BlurView>
            )}
        </SafeAreaView>
    );
};
