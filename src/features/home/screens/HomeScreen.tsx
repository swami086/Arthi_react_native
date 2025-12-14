import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/hooks/useAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { MainTabCompositeProp } from '../../../navigation/types';

export const HomeScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<MainTabCompositeProp>();

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark p-6">
            <View className="flex-row justify-between items-center mb-8">
                <View>
                    <Text className="text-lg text-text-sub-light dark:text-text-sub-dark">Hello,</Text>
                    <Text className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">
                        {user?.email?.split('@')[0]}
                    </Text>
                </View>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-200 justify-center items-center">
                    <Icon name="bell-outline" size={20} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View className="mb-8">
                <Text className="text-lg font-bold mb-4 text-text-main-light dark:text-text-main-dark">Quick Actions</Text>
                <View className="flex-row justify-between">
                    <TouchableOpacity onPress={() => navigation.navigate('Mentors')} className="bg-primary p-4 rounded-xl items-center flex-1 mr-2">
                        <Icon name="account-search" size={24} color="#fff" />
                        <Text className="text-white font-bold mt-2">Find Mentor</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Appointments')} className="bg-secondary p-4 rounded-xl items-center flex-1 ml-2">
                        <Icon name="calendar-plus" size={24} color="#fff" />
                        <Text className="text-white font-bold mt-2">Book Now</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Recent Activity Placeholder */}
            <View>
                <Text className="text-lg font-bold mb-4 text-text-main-light dark:text-text-main-dark">Recent Activity</Text>
                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                    <Text className="text-text-sub-light dark:text-text-sub-dark">No recent activity</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};
