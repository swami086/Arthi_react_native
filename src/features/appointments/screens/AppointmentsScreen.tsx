import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appointment } from '../../../api/types';
import { useAppointments } from '../hooks/useAppointments';

import { useNavigation } from '@react-navigation/native';
import { MainTabCompositeProp } from '../../../navigation/types';

export const AppointmentsScreen = () => {
    const { appointments, loading, error } = useAppointments();
    const navigation = useNavigation<MainTabCompositeProp>();

    const renderAppointment = ({ item }: { item: Appointment }) => (
        <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 shadow-sm border-l-4 border-primary">
            <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
                {new Date(item.start_time).toLocaleDateString()}
            </Text>
            <Text className="text-text-sub-light dark:text-text-sub-dark">
                {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                {new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <View className="mt-2 self-start px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                <Text className="text-xs uppercase font-bold text-text-sub-light dark:text-text-sub-dark">{item.status}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark p-6" edges={['top']}>
            <Text className="text-2xl font-bold mb-4 text-text-main-light dark:text-text-main-dark">My Appointments</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#30bae8" />
            ) : error ? (
                <Text className="text-red-500 text-center mt-10">{error}</Text>
            ) : (
                <FlatList
                    data={appointments}
                    renderItem={renderAppointment}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={
                        <View className="items-center mt-10">
                            <Text className="text-text-sub-light mb-4">No upcoming appointments</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Mentors')}
                                className="bg-primary px-6 py-3 rounded-xl"
                            >
                                <Text className="text-white font-bold">Find a Mentor</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};
