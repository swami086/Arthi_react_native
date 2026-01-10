import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/types';
import { useTherapistNotes } from '../hooks/useTherapistNotes';
import { useAuth } from '../../auth/hooks/useAuth';
import { useColorScheme } from '../../../hooks/useColorScheme';

type AddNoteRouteProp = RouteProp<RootStackParamList, 'AddNote'>;

export default function AddNoteModal() {
    const navigation = useNavigation();
    const route = useRoute<AddNoteRouteProp>();
    const { patientId } = route.params;
    const { user } = useAuth();
    const { isDark } = useColorScheme();
    const { createNote, loading, error } = useTherapistNotes(patientId);

    const [content, setContent] = useState('');
    const [isPrivate, setIsPrivate] = useState(true);

    const handleSave = async () => {
        if (!user) return;
        if (!content.trim()) return;

        try {
            await createNote(content, isPrivate, user.id);
            navigation.goBack();
        } catch (e) {
            // error handled by hook state usually, but need to ensure we don't nav back on error if hook throws
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900 pt-10">
            <View className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-gray-500 dark:text-gray-400 text-base">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">Add Note</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#30bae8" /> : <Text className="text-primary font-bold text-base">Save</Text>}
                </TouchableOpacity>
            </View>

            <View className="p-6">
                {error && <Text className="text-red-500 mb-4">{error}</Text>}

                <View className="flex-row items-center mb-6 justify-between">
                    <Text className="text-gray-900 dark:text-white font-medium">Private Note</Text>
                    <TouchableOpacity
                        onPress={() => setIsPrivate(!isPrivate)}
                        className={`w-12 h-7 rounded-full items-center px-1 flex-row ${isPrivate ? 'bg-green-500 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'}`}
                    >
                        <View className="w-5 h-5 bg-white rounded-full shadow-sm" />
                    </TouchableOpacity>
                </View>

                <TextInput
                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-gray-900 dark:text-white h-60 text-base"
                    placeholder="Type your note here..."
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    multiline
                    textAlignVertical="top"
                    value={content}
                    onChangeText={setContent}
                    autoFocus
                />
            </View>
        </View>
    );
}
