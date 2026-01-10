import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

import { useAuth } from '../../auth/hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useMyTherapists } from '../hooks/useMyTherapists';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { GradientAvatar } from '../../../components/GradientAvatar';
import { TagPill } from '../../../components/TagPill';
import { MainTabCompositeProp } from '../../../navigation/types';
import { useColorScheme } from '../../../hooks/useColorScheme';

// Mock Data
const MY_FOCUS_AREAS = ['Anxiety', 'Work Stress', 'Self-Esteem'];

import { withRollbarPerformance } from '../../../services/rollbar';

export const ProfileScreen = () => {
    const { signOut } = useAuth();
    const { profile, loading } = useProfile();
    const { therapists, loading: therapistsLoading } = useMyTherapists();
    const { appointments } = useAppointments();
    const { isDark } = useColorScheme();
    const navigation = useNavigation<MainTabCompositeProp>();

    // Calculate upcoming appointment
    const upcomingAppointment = appointments.find(app =>
        app.status === 'confirmed' && app.start_time && !isNaN(new Date(app.start_time).getTime()) && new Date(app.start_time) > new Date()
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            </View>
        );
    }

    const renderTherapistItem = ({ item }: { item: any }) => (
        <View className="bg-white dark:bg-gray-800 p-4 rounded-2xl mr-4 shadow-sm border border-gray-100 dark:border-gray-700 w-40 items-center relative">
            <View className="mb-2">
                <GradientAvatar
                    source={item.avatar ? { uri: item.avatar } : { uri: 'https://via.placeholder.com/150' }}
                    size={60}
                    online={true}
                />
            </View>
            <Text className="font-bold text-gray-900 dark:text-white mb-0.5" numberOfLines={1}>{item.name}</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-xs mb-3" numberOfLines={1}>{item.role}</Text>

            <TouchableOpacity
                className="bg-blue-50 dark:bg-blue-900/30 w-full py-2 rounded-lg items-center"
                onPress={() => navigation.navigate('ChatDetail', { otherUserId: item.id, otherUserName: item.name })}
            >
                <Text className="text-primary font-bold text-xs">Chat</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-background-dark">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row justify-between items-center bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky">
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Settings')}
                        className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full"
                    >
                        <MaterialCommunityIcons name="cog-outline" size={24} color={isDark ? "#fff" : "#333"} />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Profile Header */}
                    <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 500 }}>
                        <View className="items-center py-8 bg-white dark:bg-gray-800 mb-4 shadow-sm border-b border-gray-100 dark:border-gray-700 rounded-b-3xl">
                            <View className="mb-4">
                                <GradientAvatar
                                    source={profile?.avatar_url ? { uri: profile.avatar_url } : { uri: 'https://via.placeholder.com/150' }}
                                    size={100}
                                />
                                <TouchableOpacity className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 p-2 rounded-full border border-gray-100 dark:border-gray-600 shadow-sm">
                                    <MaterialCommunityIcons name="camera" size={16} color={isDark ? "#fff" : "#333"} />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profile?.full_name || 'User'}</Text>
                            <Text className="text-gray-500 dark:text-gray-400 font-medium mb-4 capitalize">{profile?.role || 'Member'}</Text>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('EditProfile')}
                                className="flex-row items-center px-6 py-2 border border-gray-200 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700"
                            >
                                <MaterialCommunityIcons name="pencil-outline" size={16} color={isDark ? "#fff" : "#333"} className="mr-2" />
                                <Text className="text-gray-700 dark:text-white font-bold ml-2">Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </MotiView>

                    {/* Next Session Card */}
                    <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 200, type: 'timing', duration: 500 }}>
                        <View className="px-6 mb-8">
                            {upcomingAppointment ? (
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

                                    <Text className="text-white/80 font-medium mb-1">Upcoming Session</Text>
                                    <Text className="text-white text-2xl font-bold mb-4">
                                        {upcomingAppointment.start_time && !isNaN(new Date(upcomingAppointment.start_time).getTime())
                                            ? new Date(upcomingAppointment.start_time).toLocaleDateString()
                                            : 'No Date'}
                                    </Text>

                                    <View className="flex-row items-center mb-6">
                                        <View className="bg-white/20 px-3 py-1.5 rounded-lg mr-3">
                                            <Text className="text-white font-bold">
                                                {upcomingAppointment.start_time && !isNaN(new Date(upcomingAppointment.start_time).getTime())
                                                    ? new Date(upcomingAppointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : 'TBD'}
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('VideoCallWaitingRoom', {
                                            appointmentId: upcomingAppointment.id,
                                            roomId: upcomingAppointment.video_room_id ?? undefined
                                        })}
                                        className="bg-white py-3 rounded-xl items-center shadow-md"
                                    >
                                        <Text className="text-primary font-bold text-base">Join Waiting Room</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            ) : (
                                <View className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 items-center">
                                    <Text className="text-gray-500 dark:text-gray-400">No upcoming sessions scheduled.</Text>
                                </View>
                            )}
                        </View>
                    </MotiView>

                    {/* My Focus Areas */}
                    <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 400, type: 'timing', duration: 500 }}>
                        <View className="px-6 mb-8">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">My Focus Areas</Text>
                                <TouchableOpacity>
                                    <Text className="text-primary font-bold text-sm">Edit</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row flex-wrap gap-2">
                                {MY_FOCUS_AREAS.map((area, index) => (
                                    <TagPill key={index} label={area} color={index % 2 === 0 ? 'blue' : 'purple'} />
                                ))}
                                <TouchableOpacity className="border border-dashed border-gray-300 dark:border-gray-600 rounded-full px-3 py-1">
                                    <Text className="text-gray-400 dark:text-gray-500 text-xs font-medium">+ Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </MotiView>


                    {/* My Therapists */}
                    <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 600, type: 'timing', duration: 500 }}>
                        <View className="mb-24">
                            <View className="flex-row justify-between items-center px-6 mb-4">
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">My Therapists</Text>
                                <TouchableOpacity>
                                    <Text className="text-primary font-bold text-sm">See All</Text>
                                </TouchableOpacity>
                            </View>
                            {therapists.length > 0 ? (
                                <FlatList
                                    data={therapists}
                                    renderItem={renderTherapistItem}
                                    keyExtractor={(item, index) => `${item.id}-${index}`}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 24 }}
                                />
                            ) : (
                                <View className="px-6">
                                    <Text className="text-gray-500 dark:text-gray-400 italic">No therapists connected yet.</Text>
                                </View>
                            )}

                            <View className="px-6 mt-6">
                                <View className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <Text className="text-gray-900 dark:text-white font-bold mb-2">Bio</Text>
                                    <Text className="text-gray-500 dark:text-gray-400 leading-5">
                                        {profile?.bio || "No bio added yet. Tell us a bit about yourself!"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </MotiView>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default withRollbarPerformance(ProfileScreen, 'Profile');
