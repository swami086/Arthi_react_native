import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const SignUpScreen = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'mentor' | 'mentee'>('mentee');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const { signUp, signInWithGoogle } = useAuth();
    const navigation = useNavigation<AuthNavigationProp>();

    const validate = () => {
        let newErrors: { [key: string]: string } = {};
        if (!fullName) newErrors.fullName = "Full Name is required";
        if (!email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
        if (!password) newErrors.password = "Password is required";
        else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
        if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        if (!termsAccepted) newErrors.terms = "You must accept the terms";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        if (!validate()) return;

        setLoading(true);
        const { error } = await signUp(email, password, { fullName, role });
        setLoading(false);

        if (error) {
            Alert.alert('Signup Error', error.message);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                    <Icon name="arrow-left" size={24} color="#4e8597" />
                </TouchableOpacity>

                <View className="mb-6 h-32 bg-primary/10 dark:bg-primary-dark/10 rounded-3xl items-center justify-center overflow-hidden">
                    <Text className="text-primary dark:text-primary-dark font-display font-bold text-2xl">Safe Space</Text>
                    <Text className="text-text-sub-light text-xs">Join our community</Text>
                </View>

                <Text className="text-3xl font-display font-bold mb-2 text-text-main-light dark:text-text-main-dark">
                    Create Account
                </Text>
                <Text className="text-base text-text-sub-light dark:text-text-sub-dark mb-6">
                    Start your journey with us today.
                </Text>

                <Input
                    label="Full Name"
                    placeholder="John Doe"
                    value={fullName}
                    onChangeText={(text) => { setFullName(text); if (errors.fullName) setErrors({ ...errors, fullName: '' }) }}
                    leftIcon="account-outline"
                    error={errors.fullName}
                />
                <Input
                    label="Email"
                    placeholder="john@example.com"
                    value={email}
                    onChangeText={(text) => { setEmail(text); if (errors.email) setErrors({ ...errors, email: '' }) }}
                    leftIcon="email-outline"
                    keyboardType="email-address"
                    error={errors.email}
                />
                <Input
                    label="Password"
                    placeholder="Min 8 chars"
                    value={password}
                    onChangeText={(text) => { setPassword(text); if (errors.password) setErrors({ ...errors, password: '' }) }}
                    secureTextEntry
                    leftIcon="lock-outline"
                    error={errors.password}
                />
                <Input
                    label="Confirm Password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChangeText={(text) => { setConfirmPassword(text); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' }) }}
                    secureTextEntry
                    leftIcon="lock-check-outline"
                    error={errors.confirmPassword}
                />

                <Text className="mb-2 text-text-main-light dark:text-text-main-dark font-display font-medium">I am a:</Text>
                <View className="flex-row mb-6 space-x-4">
                    <TouchableOpacity
                        onPress={() => setRole('mentee')}
                        className={`flex-1 py-3 rounded-xl border items-center shadow-sm ${role === 'mentee' ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                    >
                        <Text className={`font-bold ${role === 'mentee' ? 'text-white' : 'text-text-sub-light'}`}>Mentee</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setRole('mentor')}
                        className={`flex-1 py-3 rounded-xl border items-center shadow-sm ${role === 'mentor' ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                    >
                        <Text className={`font-bold ${role === 'mentor' ? 'text-white' : 'text-text-sub-light'}`}>Mentor</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity className="flex-row items-start mb-6" onPress={() => { setTermsAccepted(!termsAccepted); if (errors.terms) setErrors({ ...errors, terms: '' }) }}>
                    <View className={`w-6 h-6 rounded-md border items-center justify-center mr-3 mt-1 ${termsAccepted ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                        {termsAccepted && <Icon name="check" size={16} color="white" />}
                    </View>
                    <View className="flex-1">
                        <Text className="text-text-sub-light dark:text-text-sub-dark leading-5">
                            I agree to the <Text className="text-primary font-bold">Terms of Service</Text> and <Text className="text-primary font-bold">Privacy Policy</Text>
                        </Text>
                        {errors.terms && <Text className="text-red-500 text-xs mt-1">{errors.terms}</Text>}
                    </View>
                </TouchableOpacity>

                <Button title="Sign Up" onPress={handleSignUp} loading={loading} />

                <View className="flex-row items-center my-6">
                    <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <Text className="mx-4 text-gray-400 font-medium">or continue with</Text>
                    <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </View>

                <Button title="Google" onPress={signInWithGoogle} variant="outline" icon="google" iconPosition="left" />

                <View className="flex-row justify-center mt-8 mb-8">
                    <Text className="text-text-sub-light dark:text-text-sub-dark">Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text className="text-primary dark:text-primary-dark font-bold">Log In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
