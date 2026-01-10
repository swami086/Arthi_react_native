import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { usePatientGoals } from '../hooks/usePatientGoals';
import { useAuth } from '../../auth/hooks/useAuth';
import Slider from '@react-native-community/slider';
import { useColorScheme } from '../../../hooks/useColorScheme';

type AddGoalRouteProp = RouteProp<RootStackParamList, 'AddGoal'>;

export default function AddGoalModal() {
    const navigation = useNavigation();
    const route = useRoute<AddGoalRouteProp>();
    const { menteeId } = route.params;
    const { user } = useAuth();
    const { isDark } = useColorScheme();
    const { createGoal, loading, error } = usePatientGoals(menteeId);

    const [title, setTitle] = useState('');
    const [progress, setProgress] = useState(0);

    const handleSave = async () => {
        if (!user) return;
        if (!title.trim()) return;

        try {
            await createGoal({
                mentee_id: menteeId,
                mentor_id: user.id,
                goal_title: title,
                goal_description: '',
                progress_percentage: Math.round(progress),
                status: 'active'
            });
            navigation.goBack();
        } catch (e) {
            // error handled
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900 pt-10">
            <View className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-gray-500 dark:text-gray-400 text-base">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">Add Goal</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#30bae8" /> : <Text className="text-primary font-bold text-base">Save</Text>}
                </TouchableOpacity>
            </View>

            <View className="p-6">
                {error && <Text className="text-red-500 mb-4">{error}</Text>}

                <Text className="text-gray-900 dark:text-white font-bold mb-2">Goal Title</Text>
                <TextInput
                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-gray-900 dark:text-white mb-6 font-medium"
                    placeholder="e.g. Improve Public Speaking"
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                />

                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-900 dark:text-white font-bold">Initial Progress</Text>
                    <Text className="text-primary font-bold">{Math.round(progress)}%</Text>
                </View>
                <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={0}
                    maximumValue={100}
                    minimumTrackTintColor="#30bae8"
                    maximumTrackTintColor="#d3d3d3"
                    thumbTintColor="#30bae8"
                    value={progress}
                    onValueChange={setProgress}
                />
            </View>
        </View>
    );
}
