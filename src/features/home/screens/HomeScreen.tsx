import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/hooks/useAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { MotiView, MotiText } from 'moti';

import { MainTabCompositeProp } from '../../../navigation/types';

import { usePendingMentorRequests } from '../../profile/hooks/usePendingMentorRequests';

export const HomeScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<MainTabCompositeProp>();
    const { requests } = usePendingMentorRequests();

    const greetingVariants = {
        initial: { opacity: 0, translateX: -50 },
        animate: { opacity: 1, translateX: 0 }
    };

    const containerVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark p-6">
            <View className="flex-row justify-between items-center mb-8">
                <MotiView
                    from={greetingVariants.initial}
                    animate={greetingVariants.animate as any}
                    transition={{ type: 'spring', damping: 15 }}
                >
                    <Text className="text-lg text-text-sub-light dark:text-text-sub-dark">Hello,</Text>
                    <Text className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">
                        {user?.email?.split('@')[0]}
                    </Text>
                </MotiView>
                <View className="flex-row gap-3">
                    <MotiView
                        from={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 300, type: 'spring' }}
                    >
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CrisisResources' as any)}
                            className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 justify-center items-center border border-red-200 dark:border-red-800"
                        >
                            <Icon name="phone-alert" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </MotiView>
                    <MotiView
                        from={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 300, type: 'spring' }}
                    >
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Notifications')}
                            className="w-10 h-10 rounded-full bg-gray-200 justify-center items-center"
                        >
                            <Icon name="bell-outline" size={20} color="#000" />
                        </TouchableOpacity>
                    </MotiView>
                </View>
            </View>

            {requests.length > 0 && (
                <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8"
                >
                    <TouchableOpacity
                        onPress={() => navigation.navigate('PendingMentorRequests')}
                        className="bg-red-500 p-4 rounded-xl flex-row items-center justify-between shadow-md"
                    >
                        <View className="flex-row items-center">
                            <Icon name="account-alert" size={24} color="#fff" />
                            <View className="ml-3">
                                <Text className="text-white font-bold text-lg">Pending Requests</Text>
                                <Text className="text-white/90">You have {requests.length} mentor invite(s)</Text>
                            </View>
                        </View>
                        <Icon name="chevron-right" size={24} color="#fff" />
                    </TouchableOpacity>
                </MotiView>
            )}

            {/* Quick Actions */}
            <MotiView
                from={containerVariants.initial}
                animate={containerVariants.animate as any}
                className="mb-8"
            >
                <MotiView
                    from={itemVariants.initial}
                    animate={itemVariants.animate as any}
                    className="text-lg font-bold mb-4 text-text-main-light dark:text-text-main-dark"
                >
                    <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Quick Actions</Text>
                </MotiView>
                <View className="flex-row justify-between">
                    <MotiView
                        from={itemVariants.initial}
                        animate={itemVariants.animate as any}
                        className="flex-1 mr-2"
                    >
                        <TouchableOpacity onPress={() => navigation.navigate('Mentors')} className="bg-primary p-4 rounded-xl items-center w-full">
                            <Icon name="account-search" size={24} color="#fff" />
                            <Text className="text-white font-bold mt-2">Find Mentor</Text>
                        </TouchableOpacity>
                    </MotiView>
                    <MotiView
                        from={itemVariants.initial}
                        animate={itemVariants.animate as any}
                        className="flex-1 ml-2"
                    >
                        <TouchableOpacity onPress={() => navigation.navigate('Appointments')} className="bg-secondary p-4 rounded-xl items-center w-full">
                            <Icon name="calendar-plus" size={24} color="#fff" />
                            <Text className="text-white font-bold mt-2">Book Now</Text>
                        </TouchableOpacity>
                    </MotiView>
                </View>
            </MotiView>

            {/* Recent Activity Placeholder */}
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 500, type: 'spring' }}
            >
                <Text className="text-lg font-bold mb-4 text-text-main-light dark:text-text-main-dark">Recent Activity</Text>
                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                    <Text className="text-text-sub-light dark:text-text-sub-dark">No recent activity</Text>
                </View>
            </MotiView>
        </SafeAreaView>
    );
};
