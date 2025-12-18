import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainNavigator } from './MainNavigator';
import { RootStackParamList } from './types';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ActivityIndicator, View, Text, TouchableOpacity, Alert } from 'react-native';
import { getOnboardingStatus } from '../utils/helpers';

import SelectDateScreen from '../features/appointments/screens/SelectDateScreen';
import ChooseTimeScreen from '../features/appointments/screens/ChooseTimeScreen';
import ConfirmAppointmentScreen from '../features/appointments/screens/ConfirmAppointmentScreen';
import { ChatDetailScreen } from '../features/messages/screens/ChatDetailScreen';
import MentorDetailScreen from '../features/mentors/screens/MentorDetailScreen';
import SettingsScreen from '../features/profile/screens/SettingsScreen';
import { MentorNavigator } from './MentorNavigator';
import { useProfile } from '../features/profile/hooks/useProfile';

import { AdminNavigator } from './AdminNavigator';
import { PendingApprovalScreen } from '../features/auth/screens/PendingApprovalScreen';
import { PendingApprovalsScreen } from '../features/admin/screens/PendingApprovalsScreen';
import { MentorReviewScreen } from '../features/admin/screens/MentorReviewScreen';
import { ManageAdminsScreen } from '../features/admin/screens/ManageAdminsScreen';
import { CreateAdminModal } from '../features/admin/screens/CreateAdminModal';
import { AdminMentorsScreen } from '../features/admin/screens/AdminMentorsScreen';

import { AdminMenteesScreen } from '../features/admin/screens/AdminMenteesScreen';

// Mentor specific screens
import MenteeDetailScreen from '../features/mentor/screens/MenteeDetailScreen';
import SessionDetailScreen from '../features/mentor/screens/SessionDetailScreen';
import AddNoteModal from '../features/mentor/screens/AddNoteModal';
import AddGoalModal from '../features/mentor/screens/AddGoalModal';
import { MenteeDiscoveryScreen } from '../features/mentor/screens/MenteeDiscoveryScreen';
import { ReferMenteeScreen } from '../features/mentor/screens/ReferMenteeScreen';
import { ReferralManagementScreen } from '../features/mentor/screens/ReferralManagementScreen';
import { MenteeOnboardingScreen } from '../features/mentor/screens/MenteeOnboardingScreen';
import { PendingMentorRequestsScreen } from '../features/profile/screens/PendingMentorRequestsScreen';

const Stack = createStackNavigator<RootStackParamList>();

// Define custom transition spec
const customTransitionSpec = {
    open: {
        animation: 'spring',
        config: { stiffness: 1000, damping: 500, mass: 3, overshootClamping: true, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 }
    },
    close: {
        animation: 'spring',
        config: { stiffness: 1000, damping: 500, mass: 3, overshootClamping: true, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 }
    }
} as const;

export const AppNavigator = () => {
    const { user, loading: authLoading, profile } = useAuth();
    const { loading: profileLoading } = useProfile();
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

    useEffect(() => {
        const checkOnboarding = async () => {
            const completed = await getOnboardingStatus();
            setIsOnboardingCompleted(completed);
        };
        checkOnboarding();
    }, []);

    const isLoading = authLoading || (user && profileLoading) || isOnboardingCompleted === null;

    useEffect(() => {
        // Debugging state
        console.log('AppNavigator State:', {
            userPresent: !!user,
            profileLoading,
            isOnboardingCompleted,
            isLoading
        });
    }, [authLoading, user, profileLoading, isOnboardingCompleted, isLoading]);

    const handleResetSession = React.useCallback(async () => {
        try {
            const { supabase } = require('../api/supabase');
            await supabase.auth.signOut();
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.clear();
            Alert.alert(
                'Session Cleared',
                'Please restart the app if it doesn\'t recover automatically.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Reset failed:', error);
            Alert.alert('Error', 'Failed to reset session');
        }
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color="#30bae8" />
                <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#000" />
                    {/* Debug Reset Button */}
                    <Text style={{ marginTop: 20, marginBottom: 10, color: 'gray' }}>Taking longer than expected?</Text>
                    <TouchableOpacity
                        onPress={handleResetSession}
                        style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#EF4444', borderRadius: 8 }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Reset Session</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                    transitionSpec: customTransitionSpec,
                    gestureEnabled: true,
                    gestureDirection: 'horizontal',
                }}
            >
                {user ? (
                    <>
                        {profile?.role === 'admin' ? (
                            <Stack.Screen name="AdminMain" component={AdminNavigator} />
                        ) : profile?.role === 'mentor' ? (
                            profile?.approval_status === 'approved' ? (
                                <Stack.Screen name="MentorMain" component={MentorNavigator} />
                            ) : (
                                <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
                            )
                        ) : (
                            <Stack.Screen name="Main" component={MainNavigator} />
                        )}
                        <Stack.Screen name="SelectDate" component={SelectDateScreen} />
                        <Stack.Screen name="ChooseTime" component={ChooseTimeScreen} />
                        <Stack.Screen name="ConfirmAppointment" component={ConfirmAppointmentScreen} />
                        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
                        <Stack.Screen
                            name="MentorDetail"
                            component={MentorDetailScreen}
                            options={{ presentation: 'card' }}
                        />
                        <Stack.Screen
                            name="Settings"
                            component={SettingsScreen}
                            options={{
                                presentation: 'transparentModal',
                                cardStyle: { backgroundColor: 'transparent' },
                            }}
                        />
                        <Stack.Screen
                            name="MenteeDetail"
                            component={MenteeDetailScreen}
                            options={{ presentation: 'card' }}
                        />
                        <Stack.Screen
                            name="SessionDetail"
                            component={SessionDetailScreen}
                        />
                        <Stack.Screen
                            name="AddNote"
                            component={AddNoteModal}
                            options={{ presentation: 'modal' }}
                        />
                        <Stack.Screen
                            name="AddGoal"
                            component={AddGoalModal}
                            options={{ presentation: 'modal' }}
                        />

                        {/* Admin Routes */}
                        <Stack.Screen name="PendingApprovals" component={PendingApprovalsScreen} />
                        <Stack.Screen name="MentorReview" component={MentorReviewScreen} />
                        <Stack.Screen name="ManageAdmins" component={ManageAdminsScreen} />
                        <Stack.Screen
                            name="CreateAdmin"
                            component={CreateAdminModal}
                            options={{ presentation: 'modal' }}
                        />
                        <Stack.Screen name="AdminMentors" component={AdminMentorsScreen} />
                        <Stack.Screen name="AdminMentees" component={AdminMenteesScreen} />

                        {/* Mentor Specific Routes */}
                        <Stack.Screen name="MenteeDiscovery" component={MenteeDiscoveryScreen} />
                        <Stack.Screen name="ReferMentee" component={ReferMenteeScreen} />
                        <Stack.Screen name="ReferralsManagement" component={ReferralManagementScreen} />
                        <Stack.Screen name="MenteeOnboarding" component={MenteeOnboardingScreen} />
                        <Stack.Screen name="PendingMentorRequests" component={PendingMentorRequestsScreen} />
                    </>
                ) : (
                    <>
                        {!isOnboardingCompleted && (
                            <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
                        )}
                        <Stack.Screen name="Auth" component={AuthNavigator} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};


