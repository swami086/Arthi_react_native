import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../../auth/hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { GradientAvatar } from '../../../components/GradientAvatar';
import { TagPill } from '../../../components/TagPill';
import { MainTabCompositeProp } from '../../../navigation/types';

// Mock Data
const MY_FOCUS_AREAS = ['Anxiety', 'Work Stress', 'Self-Esteem'];
const MY_MENTORS = [
    { id: '1', name: 'Dr. Sarah', role: 'Therapist', avatar: 'https://via.placeholder.com/150' },
    { id: '2', name: 'Dr. Mike', role: 'Life Coach', avatar: null },
];

export const ProfileScreen = () => {
    const { signOut } = useAuth();
    const { profile, loading } = useProfile();
    const navigation = useNavigation<MainTabCompositeProp>();

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <StatusBar barStyle="dark-content" />
                {/* <ActivityIndicator size="large" color="#30bae8" /> */}
            </View>
        );
    }

    const renderMentorItem = ({ item }: { item: any }) => (
        <View className="bg-white p-4 rounded-2xl mr-4 shadow-sm border border-gray-100 w-40 items-center relative">
            <View className="mb-2">
                <GradientAvatar
                    source={item.avatar ? { uri: item.avatar } : { uri: 'https://via.placeholder.com/150' }}
                    size={60}
                    online={true}
                />
            </View>
            <Text className="font-bold text-gray-900 mb-0.5">{item.name}</Text>
            <Text className="text-gray-500 text-xs mb-3">{item.role}</Text>

            <TouchableOpacity
                className="bg-blue-50 w-full py-2 rounded-lg items-center"
                onPress={() => navigation.navigate('ChatDetail', { otherUserId: item.id, otherUserName: item.name })}
            >
                <Text className="text-primary font-bold text-xs">Chat</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row justify-between items-center bg-white border-b border-gray-100 sticky">
                    <Text className="text-2xl font-bold text-gray-900">My Profile</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Settings')}
                        className="p-2 bg-gray-50 rounded-full"
                    >
                        <MaterialCommunityIcons name="cog-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Profile Header */}
                    <View className="items-center py-8 bg-white mb-4 shadow-sm border-b border-gray-100 rounded-b-3xl">
                        <View className="mb-4">
                            <GradientAvatar
                                source={profile?.avatar_url ? { uri: profile.avatar_url } : { uri: 'https://via.placeholder.com/150' }}
                                size={100}
                            />
                            <TouchableOpacity className="absolute bottom-0 right-0 bg-white p-2 rounded-full border border-gray-100 shadow-sm">
                                <MaterialCommunityIcons name="camera" size={16} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 mb-1">{profile?.full_name || 'User'}</Text>
                        <Text className="text-gray-500 font-medium mb-4 capitalize">{profile?.role || 'Member'}</Text>

                        <TouchableOpacity className="flex-row items-center px-6 py-2 border border-gray-200 rounded-full bg-gray-50">
                            <MaterialCommunityIcons name="pencil-outline" size={16} color="#333" className="mr-2" />
                            <Text className="text-gray-700 font-bold ml-2">Edit Profile</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Next Session Card */}
                    <View className="px-6 mb-8">
                        <Text className="text-lg font-bold text-gray-900 mb-4">Up Next</Text>
                        <LinearGradient
                            colors={['#30bae8', '#9055ff']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="p-6 rounded-3xl shadow-lg relative overflow-hidden"
                        >
                            <View className="absolute top-0 right-0 p-4 opacity-20">
                                <MaterialCommunityIcons name="calendar-clock" size={120} color="white" />
                            </View>

                            <View className="flex-row justify-between items-start mb-6">
                                <View className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                    <MaterialCommunityIcons name="video" size={24} color="white" />
                                </View>
                                <View className="bg-green-400 px-3 py-1 rounded-full">
                                    <Text className="text-white font-bold text-xs uppercase">Confirmed</Text>
                                </View>
                            </View>

                            <Text className="text-white/80 font-medium mb-1">Session with</Text>
                            <Text className="text-white text-2xl font-bold mb-4">Dr. Sarah Jenkins</Text>

                            <View className="flex-row items-center mb-6">
                                <View className="bg-white/20 px-3 py-1.5 rounded-lg mr-3">
                                    <Text className="text-white font-bold">Today</Text>
                                </View>
                                <Text className="text-white text-lg font-medium">2:00 PM - 2:45 PM</Text>
                            </View>

                            <TouchableOpacity className="bg-white py-3 rounded-xl items-center shadow-md">
                                <Text className="text-primary font-bold text-base">Join Waiting Room</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                    {/* My Focus Areas */}
                    <View className="px-6 mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold text-gray-900">My Focus Areas</Text>
                            <TouchableOpacity>
                                <Text className="text-primary font-bold text-sm">Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row flex-wrap gap-2">
                            {MY_FOCUS_AREAS.map((area, index) => (
                                <TagPill key={index} label={area} color={index % 2 === 0 ? 'blue' : 'purple'} />
                            ))}
                            <TouchableOpacity className="border border-dashed border-gray-300 rounded-full px-3 py-1">
                                <Text className="text-gray-400 text-xs font-medium">+ Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* My Mentors */}
                    <View className="mb-24">
                        <View className="flex-row justify-between items-center px-6 mb-4">
                            <Text className="text-lg font-bold text-gray-900">My Mentors</Text>
                            <TouchableOpacity>
                                <Text className="text-primary font-bold text-sm">See All</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={MY_MENTORS}
                            renderItem={renderMentorItem}
                            keyExtractor={item => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 24 }}
                        />
                        {/* Bio Section - Below Mentors as in plan? Plan said "Bio section in card". Putting at bottom or above mentors. */}
                        <View className="px-6 mt-6">
                            <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <Text className="text-gray-900 font-bold mb-2">Bio</Text>
                                <Text className="text-gray-500 leading-5">
                                    {profile?.bio || "No bio added yet. Tell us a bit about yourself!"}
                                </Text>
                            </View>
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
};
