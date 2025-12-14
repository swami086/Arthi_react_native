import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signInWithGoogle } = useAuth();
    const navigation = useNavigation<AuthNavigationProp>();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);

        if (error) {
            Alert.alert('Login Error', error.message);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="flex-1 w-full max-w-md mx-auto">
                {/* Header Back Button (Optional but consistent) */}
                <View className="w-full px-4 pt-6 pb-2 flex-row items-center justify-between z-10">
                    {navigation.canGoBack() ? (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="h-10 w-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm"
                        >
                            <Icon name="arrow-left" size={24} color="#4e8597" />
                        </TouchableOpacity>
                    ) : (
                        <View className="w-10" />
                    )}
                    <View className="w-10" />
                </View>

                <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
                    <View className="items-center mb-10">
                        <View className="w-24 h-24 bg-primary/10 dark:bg-primary-dark/10 rounded-3xl items-center justify-center mb-6 shadow-sm border border-primary/20 transform rotate-3">
                            <Icon name="hand-heart" size={48} color="#30bae8" />
                        </View>

                        <Text className="text-3xl font-display font-bold mb-2 text-text-main-light dark:text-text-main-dark text-center">
                            Welcome Back
                        </Text>
                        <Text className="text-base text-text-sub-light dark:text-text-sub-dark text-center px-4 leading-relaxed">
                            Enter your safe space to continue your journey.
                        </Text>
                    </View>

                    <View className="space-y-4 w-full">
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
                    </View>

                    <View className="mt-8 mb-6">
                        <Button
                            title="Log In"
                            onPress={handleLogin}
                            loading={loading}
                            className="shadow-lg shadow-primary/30"
                            icon="login"
                            iconPosition="right"
                        />
                    </View>

                    <View className="flex-row items-center mb-6">
                        <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <Text className="mx-4 text-gray-400 font-medium text-xs uppercase tracking-widest">Or</Text>
                        <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </View>

                    <Button
                        title="Sign in with Google"
                        onPress={signInWithGoogle}
                        variant="outline"
                        icon="google"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm"
                        textClassName="text-text-main-light dark:text-white"
                    />

                    <View className="mt-10 mb-4">
                        <View className="flex-row justify-center mb-6">
                            <Text className="text-text-sub-light dark:text-text-sub-dark font-medium">Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                <Text className="text-primary dark:text-primary-dark font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};
