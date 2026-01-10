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
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

export const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();
    const { isDark } = useColorScheme();
    const navigation = useNavigation<AuthNavigationProp>();

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        const { error } = await resetPassword(email);
        setLoading(false);

        if (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', error.message);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
                'Check your email',
                'We have sent a password reset link to your email address.',
                [
                    { text: 'OK', onPress: () => navigation.navigate('Login') }
                ]
            );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <View className="flex-1 w-full max-w-md mx-auto">
                <View className="w-full px-4 pt-6 pb-2 flex-row items-center justify-between z-10">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm"
                    >
                        <Icon name="arrow-left" size={24} color={isDark ? "#fff" : "#4e8597"} />
                    </TouchableOpacity>
                    <View className="w-10" />
                </View>

                <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 400 }}
                        className="items-center mb-10"
                    >
                        <View className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full items-center justify-center mb-6 shadow-sm">
                            <Icon name="lock-reset" size={40} color="#30bae8" />
                        </View>

                        <Text className="text-[28px] font-extrabold tracking-tight mb-2 text-text-main-light dark:text-text-main-dark text-center leading-tight">
                            Reset Password
                        </Text>
                        <Text className="text-base text-text-sub-light dark:text-text-sub-dark text-center px-4 leading-relaxed font-medium">
                            Enter your email address to receive a password reset link.
                        </Text>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 400, delay: 100 }}
                        className="space-y-4 w-full"
                    >
                        <Input
                            label="Email Address"
                            placeholder="name@example.com"
                            value={email}
                            onChangeText={setEmail}
                            leftIcon="email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <View className="mt-6 mb-4">
                            <Button
                                title="Send Reset Link"
                                onPress={handleResetPassword}
                                loading={loading}
                                className="shadow-lg shadow-primary/30"
                                icon="email-send"
                                iconPosition="right"
                            />
                        </View>
                    </MotiView>
                </ScrollView>
            </View>
            {loading && (
                <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} className="absolute inset-0 items-center justify-center z-50">
                    <View className="p-8 bg-white/90 dark:bg-surface-dark/90 rounded-3xl shadow-2xl items-center justify-center">
                        <Icon name="loading" size={48} color="#30bae8" />
                        <Text className="mt-4 text-text-sub-light dark:text-text-sub-dark font-bold">Sending...</Text>
                    </View>
                </BlurView>
            )}
        </SafeAreaView>
    );
};
