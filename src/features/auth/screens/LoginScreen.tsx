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
            <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
                <View className="items-center mb-8">
                    <View className="w-20 h-20 bg-primary/10 dark:bg-primary-dark/10 rounded-full items-center justify-center mb-6 ring-2 ring-primary/20">
                        <Icon name="hand-heart" size={36} color="#30bae8" />
                    </View>

                    <Text className="text-3xl font-display font-bold mb-2 text-text-main-light dark:text-text-main-dark text-center">
                        Welcome Back
                    </Text>
                    <Text className="text-base text-text-sub-light dark:text-text-sub-dark text-center px-4">
                        Enter your safe space to continue your journey
                    </Text>
                </View>

                <View className="space-y-4">
                    <Input
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        leftIcon="email-outline"
                        keyboardType="email-address"
                    />

                    <View>
                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            leftIcon="lock-outline"
                        />
                        <TouchableOpacity className="self-end mt-1" onPress={() => console.log('Forgot Password')}>
                            <Text className="text-primary dark:text-primary-dark font-medium text-sm">Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mt-8 mb-6">
                    <Button
                        title="Log In"
                        onPress={handleLogin}
                        loading={loading}
                    />
                </View>

                <View className="flex-row items-center mb-6">
                    <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <Text className="mx-4 text-gray-400 font-medium">or continue with</Text>
                    <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </View>

                <Button
                    title="Google"
                    onPress={signInWithGoogle}
                    variant="outline"
                    icon="google"
                />

                <View className="mt-8">
                    <View className="flex-row justify-center mb-8">
                        <Text className="text-text-sub-light dark:text-text-sub-dark">New to Safe Space? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                            <Text className="text-primary dark:text-primary-dark font-bold">Create an account</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-xs text-center text-text-sub-light dark:text-text-sub-dark opacity-60">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
