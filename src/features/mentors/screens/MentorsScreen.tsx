import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../api/supabase';
import { Profile } from '../../../api/types';
import { Input } from '../../../components/Input';
import { useMentors } from '../hooks/useMentors'; // Assuming this path for the new hook
import { MainTabCompositeProp } from '../../../navigation/types';

export const MentorsScreen = () => {
    const { mentors, loading, error } = useMentors();
    const [search, setSearch] = useState('');

    const filteredMentors = mentors.filter(m =>
        m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.bio?.toLowerCase().includes(search.toLowerCase())
    );

    const navigation = useNavigation<MainTabCompositeProp>();

    const renderMentor = ({ item }: { item: Profile }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('Booking', { mentorId: item.user_id, mentorName: item.full_name || 'Mentor' })}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 shadow-sm flex-row items-center"
        >
            <View className="w-16 h-16 bg-gray-300 rounded-full mr-4 overflow-hidden items-center justify-center">
                {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} className="w-full h-full" />
                ) : (
                    <Text className="text-2xl text-gray-500 font-bold">
                        {item.full_name?.charAt(0) || 'M'}
                    </Text>
                )}
            </View>
            <View className="flex-1">
                <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">{item.full_name}</Text>
                <Text className="text-text-sub-light dark:text-text-sub-dark text-sm" numberOfLines={2}>{item.bio || 'No bio available'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark p-6" edges={['top']}>
            <Text className="text-2xl font-bold mb-4 text-text-main-light dark:text-text-main-dark">Find a Mentor</Text>
            <Input
                placeholder="Search mentors..."
                value={search}
                onChangeText={setSearch}
                leftIcon="magnify"
            />

            {loading ? (
                <ActivityIndicator size="large" color="#30bae8" />
            ) : error ? (
                <Text className="text-red-500 text-center mt-10">{error}</Text>
            ) : (
                <FlatList
                    data={filteredMentors}
                    renderItem={renderMentor}
                    keyExtractor={item => item.user_id}
                    ListEmptyComponent={<Text className="text-center text-text-sub-light mt-10">No mentors found</Text>}
                />
            )}
        </SafeAreaView>
    );
};
