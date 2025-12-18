import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAllAdmins } from '../hooks/useAllAdmins';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { AdminTabCompositeProp } from '../../../navigation/types';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { useAuth } from '../../auth/hooks/useAuth';

export const ManageAdminsScreen = () => {
    const { admins, loading, error, fetchAdmins } = useAllAdmins();
    const navigation = useNavigation<AdminTabCompositeProp>();
    const { isSuperAdmin } = useAuth();

    const renderItem = useCallback(({ item }: { item: any }) => (
        <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm flex-row items-center justify-between">
            <View>
                <Text className="font-bold text-lg text-text-main-light dark:text-white">{item.full_name}</Text>
                <Text className="text-sm text-text-sub-light dark:text-gray-400">{item.email}</Text>
                {item.is_super_admin && (
                    <View className="bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded self-start mt-1">
                        <Text className="text-purple-700 dark:text-purple-300 text-xs font-bold">SUPER ADMIN</Text>
                    </View>
                )}
            </View>
            {isSuperAdmin && !item.is_super_admin && (
                <TouchableOpacity className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <Icon name="dots-vertical" size={20} color="#666" />
                </TouchableOpacity>
            )}
        </View>
    ), [isSuperAdmin]);

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-6 py-4 bg-white dark:bg-gray-800 shadow-sm z-10 flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <Icon name="arrow-left" size={24} color="#4e8597" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-text-main-light dark:text-white">Admin Team</Text>
                </View>
                {isSuperAdmin && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateAdmin')}
                        className="bg-primary px-3 py-2 rounded-lg flex-row items-center"
                    >
                        <Icon name="plus" size={16} color="white" className="mr-1" />
                        <Text className="text-white font-bold text-sm">Add New</Text>
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <View className="mx-6 mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Text className="text-red-800 dark:text-red-200">{error}</Text>
                </View>
            )}

            <ErrorBoundary>
                <FlatList
                    data={admins}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item?.user_id || `admin-${index}`}
                    contentContainerStyle={{ padding: 24 }}
                    refreshing={loading}
                    onRefresh={fetchAdmins}
                />
            </ErrorBoundary>
        </SafeAreaView>
    );
};
