import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useProfile } from '../hooks/useProfile';

export const ProfileScreen = () => {
    const { signOut } = useAuth();
    const { profile, loading, updateProfile } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setBio(profile.bio || '');
        }
    }, [profile]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile({ full_name: fullName, bio });
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark justify-center items-center">
                <ActivityIndicator size="large" color="#30bae8" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark" edges={['top']}>
            <ScrollView className="flex-1 p-6">
                <View className="items-center mb-8">
                    <View className="w-24 h-24 bg-gray-300 rounded-full mb-4 items-center justify-center overflow-hidden">
                        {profile?.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
                        ) : (
                            <Text className="text-4xl text-gray-500 font-bold">
                                {profile?.full_name?.charAt(0) || '?'}
                            </Text>
                        )}
                    </View>
                    {!isEditing && (
                        <>
                            <Text className="text-2xl font-bold text-text-main-light dark:text-text-main-dark mb-1">
                                {profile?.full_name || 'User'}
                            </Text>
                            <Text className="text-text-sub-light dark:text-text-sub-dark mb-1 capitalize">
                                {profile?.role}
                            </Text>
                        </>
                    )}
                </View>

                {isEditing ? (
                    <View className="mb-6">
                        <Input
                            label="Full Name"
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Enter your full name"
                        />
                        <Input
                            label="Bio"
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Tell us about yourself"
                            multiline
                            numberOfLines={4}
                        />
                        <View className="flex-row mt-4 space-x-4">
                            <View className="flex-1 mr-2">
                                <Button title="Cancel" onPress={() => setIsEditing(false)} variant="outline" />
                            </View>
                            <View className="flex-1 ml-2">
                                <Button title="Save" onPress={handleSave} loading={saving} />
                            </View>
                        </View>
                    </View>
                ) : (
                    <View className="mb-8">
                        <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4">
                            <Text className="text-sm text-text-sub-light dark:text-text-sub-dark mb-1 uppercase font-bold">Bio</Text>
                            <Text className="text-text-main-light dark:text-text-main-dark">
                                {profile?.bio || 'No bio provided yet.'}
                            </Text>
                        </View>

                        <Button title="Edit Profile" onPress={() => setIsEditing(true)} variant="secondary" className="mb-4" />
                        <Button title="Sign Out" onPress={signOut} variant="outline" className="border-red-500" textClassName="text-red-500" />

                        <Button
                            title="Reset Onboarding (Debug)"
                            onPress={async () => {
                                const { setOnboardingCompleted } = require('../../../utils/helpers');
                                await setOnboardingCompleted(false);
                                Alert.alert('Done', 'Onboarding reset. Please restart the app.');
                            }}
                            variant="ghost"
                            className="mt-4"
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};
