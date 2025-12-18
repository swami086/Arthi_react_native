import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/hooks/useAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { supabase } from '../../../api/supabase';
import { pickImage, uploadImageToSupabase } from '../../../utils/imageUpload';

export const MentorProfileScreen = () => {
    const { user, profile, refreshProfile, signOut } = useAuth();
    // Removed isEditing state, fields are always editable
    const [bio, setBio] = useState(profile?.bio || '');
    const [specialization, setSpecialization] = useState(profile?.specialization || '');
    const [yearsExp, setYearsExp] = useState(profile?.years_of_experience?.toString() || '');
    const [isAvailable, setIsAvailable] = useState(profile?.is_available || false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    bio,
                    specialization,
                    years_of_experience: parseInt(yearsExp) || 0,
                    is_available: isAvailable,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', profile?.user_id);

            if (error) throw error;
            await refreshProfile();
            await refreshProfile();
            Alert.alert("Success", "Profile updated successfully");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarPress = async () => {
        if (!user) return;
        const uri = await pickImage();
        if (uri) {
            setLoading(true);
            try {
                const publicUrl = await uploadImageToSupabase(uri, user.id);
                if (publicUrl) {
                    const { error } = await supabase
                        .from('profiles')
                        .update({ avatar_url: publicUrl })
                        .eq('user_id', user.id);

                    if (error) throw error;
                    await refreshProfile();
                    Alert.alert('Success', 'Profile picture updated');
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to upload image');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAvailabilityToggle = async (value: boolean) => {
        setIsAvailable(value);
        if (!user) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_available: value })
                .eq('user_id', user.id);

            if (error) {
                setIsAvailable(!value);
                throw error;
            }
            refreshProfile();
        } catch (error) {
            Alert.alert('Error', 'Failed to update availability');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header */}
                <View className="bg-white dark:bg-gray-800 pb-6 rounded-b-[30px] shadow-sm mb-6">
                    <View className="px-6 py-4 flex-row justify-between items-center">
                        <Text className="text-xl font-bold text-text-main-light dark:text-white">Profile</Text>
                        <TouchableOpacity onPress={signOut}>
                            <Icon name="logout" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    </View>

                    <View className="items-center mt-2">
                        <TouchableOpacity onPress={handleAvatarPress} className="relative">
                            <View className="h-28 w-28 bg-gray-200 rounded-full overflow-hidden shadow-md border-4 border-white dark:border-gray-700">
                                {profile?.avatar_url ? (
                                    <Image source={{ uri: profile.avatar_url }} className="h-full w-full" />
                                ) : (
                                    <View className="h-full w-full items-center justify-center bg-gray-300">
                                        <Icon name="account" size={60} color="#999" />
                                    </View>
                                )}
                            </View>
                            <View className="absolute bottom-0 right-0 bg-indigo-600 h-8 w-8 rounded-full items-center justify-center border-2 border-white">
                                <Icon name="camera" size={16} color="white" />
                            </View>
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-text-main-light dark:text-white mt-3">{profile?.full_name}</Text>
                        <Text className="text-primary font-medium">{profile?.specialization || 'Mentor'}</Text>
                    </View>
                </View>

                {/* Availability Toggle */}
                <View className="mx-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className={`h-10 w-10 rounded-full items-center justify-center mr-3 ${isAvailable ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <Icon name={isAvailable ? "check-circle" : "cancel"} size={24} color={isAvailable ? "#16a34a" : "#9ca3af"} />
                        </View>
                        <View>
                            <Text className="font-bold text-text-main-light dark:text-white">Availability</Text>
                            <Text className="text-xs text-text-sub-light dark:text-gray-400">{isAvailable ? 'Accepting new mentees' : 'Not accepting mentees'}</Text>
                        </View>
                    </View>
                    <Switch
                        value={isAvailable}
                        onValueChange={handleAvailabilityToggle}
                        trackColor={{ false: "#767577", true: "#4e8597" }}
                        thumbColor={isAvailable ? "#fff" : "#f4f3f4"}
                    />
                </View>

                {/* Edit Form */}
                <View className="mx-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-lg font-bold text-text-main-light dark:text-white">Details</Text>
                    </View>

                    <View className="space-y-4">
                        <Input
                            label="Specialization"
                            value={specialization}
                            onChangeText={setSpecialization}
                            editable={true}
                            placeholder="e.g. Career Guidance"
                        />
                        <Input
                            label="Years of Experience"
                            value={yearsExp}
                            onChangeText={setYearsExp}
                            editable={true}
                            keyboardType="numeric"
                            placeholder="e.g. 5"
                        />
                        <View>
                            <Text className="mb-1 text-sm font-bold text-text-main-light dark:text-gray-300">Bio</Text>
                            <TextInput
                                value={bio}
                                onChangeText={setBio}
                                editable={true}
                                multiline
                                numberOfLines={4}
                                className={`w-full px-4 py-3 rounded-xl border bg-background-light dark:bg-gray-900 dark:text-white text-text-main-light leading-5 border-gray-200 dark:border-gray-700`}
                                placeholder="Tell mentees about yourself..."
                                textAlignVertical="top"
                            />
                        </View>

                        <Button
                            title="Save Changes"
                            onPress={handleSave}
                            loading={loading}
                            className="mt-4"
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
