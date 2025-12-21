import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../../../api/supabase';

export const EditProfileScreen = () => {
    const { profile, refreshProfile } = useAuth();
    const { isDark } = useColorScheme();
    const navigation = useNavigation();

    const [fullName, setFullName] = useState(profile?.full_name || '');
    // const [bio, setBio] = useState(profile?.bio || ''); // Assuming bio exists in profile types, if not I'll stick to full_name for now
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'Full name cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', profile?.user_id);

            if (error) throw error;

            await refreshProfile();
            Alert.alert('Success', 'Profile updated successfully');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark" edges={['top', 'left', 'right']}>
            <View className="px-4 py-4 flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Icon name="close" size={24} color={isDark ? '#fff' : '#0f172a'} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
                    Edit Profile
                </Text>
                <TouchableOpacity onPress={handleSave} disabled={loading} className="p-2">
                    <Text className={`font-bold ${loading ? 'text-gray-400' : 'text-primary'}`}>Save</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <View className="items-center mb-8">
                        <View className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center mb-2 overflow-hidden">
                            {profile?.avatar_url ? (
                                // Placeholder for avatar image
                                <View className="w-full h-full bg-primary items-center justify-center">
                                    <Text className="text-white text-2xl font-bold">{fullName.charAt(0)}</Text>
                                </View>
                            ) : (
                                <Icon name="account" size={48} color={isDark ? '#9ca3af' : '#6b7280'} />
                            )}
                        </View>
                        <TouchableOpacity>
                            <Text className="text-primary font-bold">Change Photo</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="space-y-4">
                        <Input
                            label="Full Name"
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Enter your full name"
                            leftIcon="account"
                        />

                        {/* Add more fields here as needed */}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View className="p-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                    title="Save Changes"
                    onPress={handleSave}
                    loading={loading}
                />
            </View>
        </SafeAreaView>
    );
};
