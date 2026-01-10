import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../navigation/types';
import { usePatientDetail } from '../hooks/usePatientDetail';
import { GradientAvatar } from '../../../components/GradientAvatar';
import { TagPill } from '../../../components/TagPill';
import { GoalProgress } from '../../../components/GoalProgress';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { LoadingSkeleton } from '../../../components/LoadingSkeleton';

type PatientDetailRouteProp = RouteProp<RootStackParamList, 'PatientDetail'>;

export default function PatientDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<PatientDetailRouteProp>();
    const { patientId, patientName, patientAvatar } = route.params;

    const { patient, goals, notes, loading, error, refetch } = usePatientDetail(patientId);

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView className="flex-1" edges={['top']}>
                <View className="px-6 py-4 flex-row items-center bg-white border-b border-gray-100">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Patient Profile</Text>
                </View>

                {error && (
                    <ErrorBanner
                        message={error}
                        visible={!!error}
                        onRetry={refetch}
                    />
                )}

                {loading ? (
                    <View className="p-6 items-center">
                        <LoadingSkeleton width={100} height={100} borderRadius={50} style={{ marginBottom: 16 }} />
                        <LoadingSkeleton width="60%" height={32} style={{ marginBottom: 8 }} />
                        <LoadingSkeleton width="30%" height={20} style={{ marginBottom: 32 }} />
                        <LoadingSkeleton width="100%" height={150} borderRadius={12} style={{ marginBottom: 32 }} />
                        <LoadingSkeleton width="100%" height={150} borderRadius={12} />
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
                        <View className="items-center mb-8">
                            <GradientAvatar
                                source={patient?.avatar_url ? { uri: patient.avatar_url } : (patientAvatar ? { uri: patientAvatar } : { uri: 'https://via.placeholder.com/150' })}
                                size={100}
                            />
                            <Text className="text-2xl font-bold text-gray-900 mt-4">{patient?.full_name || patientName}</Text>
                            <Text className="text-gray-500 mb-2">Student</Text>

                            <View className="flex-row gap-2 mt-2">
                                <TouchableOpacity
                                    className="bg-blue-500 px-6 py-2 rounded-full flex-row items-center"
                                    onPress={() => navigation.navigate('ChatDetail', { otherUserId: patientId, otherUserName: patientName })}
                                >
                                    <MaterialCommunityIcons name="message-text-outline" size={18} color="white" className="mr-2" />
                                    <Text className="text-white font-bold">Message</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="bg-gray-100 px-6 py-2 rounded-full flex-row items-center">
                                    <MaterialCommunityIcons name="calendar-plus" size={18} color="#333" className="mr-2" />
                                    <Text className="text-gray-800 font-bold">Schedule</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="mb-8">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold text-gray-900">Private Notes</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('AddNote', { patientId })}>
                                    <Text className="text-primary font-bold text-sm">+ Add Note</Text>
                                </TouchableOpacity>
                            </View>
                            {notes.length > 0 ? (
                                <View className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                    <Text className="text-gray-800 leading-6">{notes[0].note_content}</Text>
                                    <Text className="text-gray-400 text-xs mt-2 text-right">
                                        Last updated: {new Date(notes[0].updated_at).toLocaleDateString()}
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-gray-400 italic">No notes added yet.</Text>
                            )}
                        </View>

                        <View className="mb-8">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold text-gray-900">Active Goals</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('AddGoal', { patientId })}>
                                    <Text className="text-primary font-bold text-sm">+ Add Goal</Text>
                                </TouchableOpacity>
                            </View>
                            {goals.length > 0 ? (
                                goals.map((goal, index) => (
                                    <GoalProgress
                                        key={`${goal.id}-${index}`}
                                        title={goal.goal_title}
                                        percentage={goal.progress_percentage}
                                        color={goal.progress_percentage > 70 ? '#10B981' : '#F59E0B'}
                                    />
                                ))
                            ) : (
                                <Text className="text-gray-400 italic">No goals active.</Text>
                            )}
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}
