import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
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
            <View className="flex-1 w-full max-w-md mx-auto">
                {/* Header */}
                <View className="w-full px-4 pt-6 pb-2 flex-row items-center justify-between z-10">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm"
                    >
                        <Icon name="arrow-left" size={24} color="#4e8597" />
                    </TouchableOpacity>
                    <View className="w-10" />
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                    {/* Header Image */}
                    <View className="w-full px-4 pb-2">
                        <View className="w-full h-32 rounded-2xl overflow-hidden shadow-sm relative bg-black">
                            <Image
                                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeii2IgyATXOOrSDdedqXOSd8WlrRVLLL29GRV7d0237RECOVtWzAkg0Ypw1AXqWhrXniFxY_uFCZozdHDdPdmZpah9EdnyjMerN9vZgjUxH9SHD9sfeNcJLVC3rdYNZ4DUX2O3lAiNnrbq2kFfmubOM1OUVfFl2ad8ZOctwADy0kuuOA67OuHZGO8XBOlKHr0ChTkPI_GXPpjmBnAJOS_T96UjVW4qoYwObSCcGtA0nogkBTgwJM4MGrFghDQbFgjuamgFkljSaan" }}
                                className="w-full h-full opacity-80"
                                resizeMode="cover"
                            />
                            <View className="absolute bottom-3 left-4">
                                <Text className="text-white text-xs font-bold uppercase tracking-widest opacity-90">Safe Space</Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex flex-col px-6 pt-2 pb-6">
                        <Text className="text-text-main-light dark:text-text-main-dark tracking-tight text-[28px] font-extrabold leading-tight">
                            Create Account
                        </Text>
                        <Text className="text-text-sub-light dark:text-sub-dark text-sm font-medium leading-relaxed mt-2">
                            Join our community to find your voice and receive the support you deserve.
                        </Text>
                    </View>

                    <View className="px-6 flex flex-col gap-4">
                        <Input
                            label="Full Name"
                            placeholder="Jane Doe"
                            value={fullName}
                            onChangeText={(text) => { setFullName(text); if (errors.fullName) setErrors({ ...errors, fullName: '' }) }}
                            leftIcon="account"
                            error={errors.fullName}
                        />

                        <Input
                            label="Email Address"
                            placeholder="jane@example.com"
                            value={email}
                            onChangeText={(text) => { setEmail(text); if (errors.email) setErrors({ ...errors, email: '' }) }}
                            leftIcon="email"
                            keyboardType="email-address"
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={(text) => { setPassword(text); if (errors.password) setErrors({ ...errors, password: '' }) }}
                            secureTextEntry
                            leftIcon="lock"
                            error={errors.password}
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={(text) => { setConfirmPassword(text); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' }) }}
                            secureTextEntry
                            leftIcon="shield-check"
                            error={errors.confirmPassword}
                        />

                        {/* Role Selection */}
                        <Text className="text-sm font-bold uppercase tracking-wider text-text-sub-light dark:text-gray-400 ml-1 mt-2">I am a:</Text>
                        <View className="flex-row space-x-4">
                            <TouchableOpacity
                                onPress={() => setRole('mentee')}
                                className={`flex-1 py-3.5 rounded-2xl border items-center shadow-sm transition-all ${role === 'mentee' ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                            >
                                <Text className={`font-bold ${role === 'mentee' ? 'text-white' : 'text-text-sub-light'}`}>Mentee</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setRole('mentor')}
                                className={`flex-1 py-3.5 rounded-2xl border items-center shadow-sm transition-all ${role === 'mentor' ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                            >
                                <Text className={`font-bold ${role === 'mentor' ? 'text-white' : 'text-text-sub-light'}`}>Mentor</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Terms */}
                        <View className="flex-row items-start mt-2 px-1">
                            <TouchableOpacity
                                onPress={() => { setTermsAccepted(!termsAccepted); if (errors.terms) setErrors({ ...errors, terms: '' }) }}
                                className="h-6 items-center flex-row"
                            >
                                <View className={`h-5 w-5 rounded border items-center justify-center transition-colors ${termsAccepted ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                                    {termsAccepted && <Icon name="check" size={14} color="white" />}
                                </View>
                            </TouchableOpacity>
                            <View className="ml-3 flex-1">
                                <Text className="text-xs font-medium text-text-sub-light dark:text-gray-400 leading-5">
                                    I agree to the <Text className="font-semibold text-primary">Terms of Service</Text> and <Text className="font-semibold text-primary">Privacy Policy</Text>.
                                </Text>
                                {errors.terms && <Text className="text-red-500 text-xs mt-1">{errors.terms}</Text>}
                            </View>
                        </View>

                        <Button
                            title="Sign Up"
                            onPress={handleSignUp}
                            loading={loading}
                            className="mt-2 shadow-lg shadow-primary/30"
                            icon="login"
                            iconPosition="right"
                        />

                        {/* Divider */}
                        <View className="relative flex items-center justify-center my-2 h-10">
                            <View className="h-px bg-gray-200 dark:bg-gray-700 w-full absolute" />
                            <Text className="bg-background-light dark:bg-background-dark px-3 text-xs font-bold text-text-sub-light dark:text-gray-400 relative z-10 uppercase tracking-widest">
                                Or
                            </Text>
                        </View>

                        {/* Google Button */}
                        <Button
                            title="Sign Up with Google"
                            onPress={signInWithGoogle}
                            variant="outline"
                            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm"
                            textClassName="text-text-main-light dark:text-white"
                            icon="google"
                        />

                        <View className="mt-4 flex-row items-center justify-center gap-1">
                            <Text className="text-text-sub-light dark:text-gray-400 text-sm font-medium">Already have an account?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text className="font-bold text-primary">Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};
