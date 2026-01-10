import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotiView } from 'moti';
import { useNotifications, Notification } from '../hooks/useNotifications';

export const NotificationsScreen = () => {
    const { isDark } = useColorScheme();
    const navigation = useNavigation();
    const { notifications, loading, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    }, [fetchNotifications]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'appointment': return 'calendar-check';
            case 'message': return 'message-text';
            case 'payment': return 'credit-card-check';
            case 'system': return 'information';
            default: return 'bell';
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'appointment': return '#30bae8';
            case 'message': return '#8b5cf6';
            case 'payment': return '#10b981';
            case 'system': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const renderItem = ({ item, index }: { item: Notification, index: number }) => (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 50 }}
        >
            <TouchableOpacity
                className={`bg-white dark:bg-gray-800 p-4 mb-3 rounded-xl border-l-4 shadow-sm flex-row items-start ${item.is_read ? 'border-l-gray-300 dark:border-l-gray-600 opacity-80' : 'border-l-primary dark:border-l-primary-dark'}`}
                onPress={() => markAsRead(item.id)}
            >
                <View className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 mr-3`}>
                    <Icon name={getIcon(item.type)} size={20} color={getColor(item.type)} />
                </View>
                <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                        <Text className={`text-base flex-1 mr-2 ${item.is_read ? 'font-medium text-gray-700 dark:text-gray-300' : 'font-bold text-gray-900 dark:text-white'}`}>
                            {item.title}
                        </Text>
                        <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-5">
                        {item.message}
                    </Text>
                </View>
                {!item.is_read && (
                    <View className="w-2 h-2 rounded-full bg-red-500 absolute top-4 right-4" />
                )}
            </TouchableOpacity>
        </MotiView>
    );

    if (loading && !refreshing && notifications.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark justify-center items-center">
                <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
            <View className="px-4 py-3 flex-row items-center justify-between bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Icon name="arrow-left" size={24} color={isDark ? '#fff' : '#0f172a'} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
                    Notifications
                </Text>
                <TouchableOpacity className="p-2" onPress={markAllAsRead}>
                    <Icon name="check-all" size={24} color={isDark ? '#fff' : '#0f172a'} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View className="items-center justify-center py-20">
                        <Icon name="bell-off-outline" size={48} color={isDark ? '#4b5563' : '#9ca3af'} />
                        <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">No notifications yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};
