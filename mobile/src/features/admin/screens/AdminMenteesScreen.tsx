import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAllPatients } from '../hooks/useAllPatients';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';

export const AdminPatientsScreen = () => {
    const { mentees, loading, fetchPatients } = useAllPatients();
    const navigation = useNavigation<any>();
    const [search, setSearch] = useState('');

    const filteredPatients = mentees.filter(m =>
        m.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 100, type: 'timing', duration: 350 }}
        >
            <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm flex-row items-center">
                <View className="h-12 w-12 bg-gray-200 rounded-full overflow-hidden mr-3">
                    {item.avatar_url && (
                        <Image source={{ uri: item.avatar_url }} className="h-full w-full" />
                    )}
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-lg text-text-main-light dark:text-white">{item.full_name}</Text>
                    <Text className="text-sm text-text-sub-light dark:text-gray-400">Patient</Text>
                </View>
                <TouchableOpacity className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <Icon name="dots-vertical" size={20} color="#666" />
                </TouchableOpacity>
            </View>
        </MotiView>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 500 }}
            >
                <View className="px-6 py-4 bg-white dark:bg-gray-800 shadow-sm z-10">
                    <View className="flex-row items-center mb-4">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                            <Icon name="arrow-left" size={24} color="#4e8597" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-text-main-light dark:text-white">All Patients</Text>
                    </View>
                    <View className="bg-gray-100 dark:bg-gray-700 rounded-lg flex-row items-center px-3 py-2">
                        <Icon name="magnify" size={20} color="#999" />
                        <TextInput
                            placeholder="Search mentees..."
                            value={search}
                            onChangeText={setSearch}
                            className="flex-1 ml-2 text-text-main-light dark:text-white"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>
            </MotiView>

            <FlatList
                data={filteredPatients}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.user_id}-${index}`}
                contentContainerStyle={{ padding: 24 }}
                refreshing={loading}
                onRefresh={fetchPatients}
            />
        </SafeAreaView>
    );
};
