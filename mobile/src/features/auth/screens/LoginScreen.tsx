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
                            {/* Update hero icon container: w-20 h-20 rounded-full bg-primary/10 */}
                            <MotiView
                                from={{ scale: 0, rotate: '-10deg' }}
                                animate={{ scale: 1, rotate: '0deg' }}
                                transition={{ type: 'spring', damping: 12 }}
                                className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full items-center justify-center mb-6 shadow-sm"
                            >
                                <Icon name="hand-heart" size={40} color="#30bae8" />
                            </MotiView>

                            {/* Enhance headline: text-[28px] font-extrabold tracking-tight */}
                            <Text className="text-[28px] font-extrabold tracking-tight mb-2 text-text-main-light dark:text-text-main-dark text-center leading-tight">
                                Welcome Back
                            </Text>
                            {/* Update subtitle styling for better readability */}
                            <Text className="text-base text-text-sub-light dark:text-text-sub-dark text-center px-4 leading-relaxed font-medium">
                                Enter your safe space to continue your journey.
                            </Text>
                        </MotiView>

                        {/* @ts-ignore */}
                        <MotiView
                            animate={shake ? shakeVariants.shake as any : shakeVariants.initial as any}
                            className="space-y-4 w-full"
                        >
                            {/* Enhance input fields with left icons (use updated Input component) */}
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
                                {/* Add "Forgot Password?" link with primary color */}
                                <TouchableOpacity className="self-end mt-2" onPress={() => navigation.navigate('ForgotPassword')}>
                                    <Text className="text-primary dark:text-primary-dark font-bold text-sm">Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>

                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing', duration: 400, delay: 200 }}
                                className="mt-6 mb-4"
                            >
                                {/* Update "Log In" button with enhanced shadow */}
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
                            className="flex-row items-center mb-6 mt-2"
                        >
                            {/* Improve divider styling with "or" text */}
                            <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                            <Text className="mx-4 text-text-sub-light dark:text-text-sub-dark font-bold text-xs uppercase tracking-widest">Or</Text>
                            <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        </MotiView>

                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 400, delay: 400 }}
                        >
                            {/* Enhance "Login with Google" button with Google icon */}
                            <Button
                                title="Sign in with Google"
                                onPress={signInWithGoogle}
                                variant="outline"
                                icon="google"
                                className="bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 shadow-sm"
                                textClassName="text-text-main-light dark:text-text-main-dark"
                            />
                        </MotiView>

                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 400, delay: 500 }}
                            className="mt-8 mb-4"
                        >
                            <View className="flex-row justify-center mb-2">
                                <Text className="text-text-sub-light dark:text-text-sub-dark font-medium">Don't have an account? </Text>
                                {/* Update "Create an account" link styling */}
                                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                    <Text className="text-primary dark:text-primary-dark font-bold">Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                            {/* Add terms text at bottom */}
                            <Text className="text-text-sub-light dark:text-text-sub-dark text-xs text-center px-8 opacity-60 mt-4 leading-relaxed">
                                By continuing, you agree to our Terms of Service and Privacy Policy.
                            </Text>
                        </MotiView>
                    </MotiView>
                </ScrollView>
            </View>
            {loading && (
                // Improve loading overlay with blur effect
                <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} className="absolute inset-0 items-center justify-center z-50">
                    <MotiView
                        from={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'timing', duration: 200 }}
                        className="p-8 bg-white/90 dark:bg-surface-dark/90 rounded-3xl shadow-2xl items-center justify-center"
                    >
                        <MotiView
                            from={{ rotate: '0deg' }}
                            animate={{ rotate: '360deg' }}
                            transition={{ loop: true, repeatReverse: false, type: 'timing', duration: 1000 }}
                        >
                            <Icon name="loading" size={48} color="#30bae8" />
                        </MotiView>
                        <Text className="mt-4 text-text-sub-light dark:text-text-sub-dark font-bold">Logging in...</Text>
                    </MotiView>
                </BlurView>
            )}
        </SafeAreaView>
    );
};
