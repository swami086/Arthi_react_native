import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { initializeGoogleSignIn } from '../services/googleSignInService';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainNavigator } from './MainNavigator';
import { RootStackParamList } from './types';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ActivityIndicator, View, Text, TouchableOpacity, Alert } from 'react-native';
import { getOnboardingStatus } from '../utils/helpers';
import { useColorScheme } from '../hooks/useColorScheme';

import { tokens } from '../design-system/tokens';

import SelectDateScreen from '../features/appointments/screens/SelectDateScreen';
import ChooseTimeScreen from '../features/appointments/screens/ChooseTimeScreen';
import ConfirmAppointmentScreen from '../features/appointments/screens/ConfirmAppointmentScreen';
import { ChatDetailScreen } from '../features/messages/screens/ChatDetailScreen';
import TherapistDetailScreen from '../features/therapists/screens/TherapistDetailScreen';
import SettingsScreen from '../features/profile/screens/SettingsScreen';
import { TherapistNavigator } from './TherapistNavigator';
import { useProfile } from '../features/profile/hooks/useProfile';
import { EditProfileScreen } from '../features/profile/screens/EditProfileScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';

import { AdminNavigator } from './AdminNavigator';
import { PendingApprovalScreen } from '../features/auth/screens/PendingApprovalScreen';
import { PendingApprovalsScreen } from '../features/admin/screens/PendingApprovalsScreen';
import { TherapistReviewScreen } from '../features/admin/screens/TherapistReviewScreen';
import { ManageAdminsScreen } from '../features/admin/screens/ManageAdminsScreen';
import { CreateAdminModal } from '../features/admin/screens/CreateAdminModal';
import { AdminTherapistsScreen } from '../features/admin/screens/AdminTherapistsScreen';

import { AdminPatientsScreen } from '../features/admin/screens/AdminPatientsScreen';

// Therapist specific screens
import PatientDetailScreen from '../features/therapist/screens/PatientDetailScreen';
import SessionDetailScreen from '../features/therapist/screens/SessionDetailScreen';
import AddNoteModal from '../features/therapist/screens/AddNoteModal';
import AddGoalModal from '../features/therapist/screens/AddGoalModal';
import { PatientDiscoveryScreen } from '../features/therapist/screens/PatientDiscoveryScreen';
import { ReferPatientScreen } from '../features/therapist/screens/ReferPatientScreen';
import { ReferralManagementScreen } from '../features/therapist/screens/ReferralManagementScreen';
import { PatientOnboardingScreen } from '../features/therapist/screens/PatientOnboardingScreen';
import { PendingTherapistRequestsScreen } from '../features/profile/screens/PendingTherapistRequestsScreen';

// Payment & Video Screens
import { PaymentCheckoutScreen } from '../features/appointments/screens/PaymentCheckoutScreen';
import { UPIPaymentProcessingScreen } from '../features/appointments/screens/UPIPaymentProcessingScreen';
import { PaymentSuccessScreen } from '../features/appointments/screens/PaymentSuccessScreen';
import { PaymentHistoryScreen } from '../features/appointments/screens/PaymentHistoryScreen';
import { VideoCallWaitingRoomScreen } from '../features/appointments/screens/VideoCallWaitingRoomScreen';
import { VideoCallScreen } from '../features/appointments/screens/VideoCallScreen';
import { PostSessionFeedbackScreen } from '../features/appointments/screens/PostSessionFeedbackScreen';
import { TherapistPaymentDashboardScreen } from '../features/therapist/screens/TherapistPaymentDashboardScreen';
import { ResourcesScreen } from '../features/therapist/screens/ResourcesScreen';
import { CrisisResourcesScreen } from '../features/resources/screens/CrisisResourcesScreen';
import { navigationRef, onNavigationStateChange, onUnhandledAction } from './navigationErrorHandler';
import { reportError } from '../services/rollbar';
import { ErrorBoundary } from '../components/ErrorBoundary';

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


const AppLoadingScreen = () => {
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

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <ActivityIndicator size="large" color={tokens.colors.primary.light} />
            <View style={{ marginTop: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={tokens.colors.text.primary.light} />
                <Text style={{ marginTop: 20, marginBottom: 10, color: 'gray' }}>Taking longer than expected?</Text>
                <TouchableOpacity
                    onPress={handleResetSession}
                    style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: tokens.colors.status.error, borderRadius: tokens.borderRadius.md }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Reset Session</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export const AppNavigator = () => {
    const { user, loading: authLoading, profile } = useAuth();
    const { loading: profileLoading } = useProfile();
    const { isDark } = useColorScheme();
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

    useEffect(() => {
        const checkOnboarding = async () => {
            const completed = await getOnboardingStatus();
            setIsOnboardingCompleted(completed);
        };
        checkOnboarding();
    }, []);

    useEffect(() => {
        if (!authLoading) {
            initializeGoogleSignIn();
        }
    }, [authLoading]);

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

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                transitionSpec: customTransitionSpec,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            {isLoading && !user ? (
                <Stack.Screen name="AppLoading" component={AppLoadingScreen} />
            ) : user ? (
                <>
                    {profile?.role === 'admin' ? (
                        <Stack.Screen name="AdminMain" component={AdminNavigator} />
                    ) : profile?.role === 'therapist' ? (
                        profile?.approval_status === 'approved' ? (
                            <Stack.Screen name="TherapistMain" component={TherapistNavigator} />
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
                        name="TherapistDetail"
                        component={TherapistDetailScreen}
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
                        name="EditProfile"
                        component={EditProfileScreen}
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen name="Notifications" component={NotificationsScreen} />
                    <Stack.Screen
                        name="PatientDetail"
                        component={PatientDetailScreen}
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

                    {/* AI Scribe Screens */}
                    <Stack.Screen
                        name="TranscriptViewer"
                        component={require('../features/therapist/screens/TranscriptViewerScreen').default}
                    />
                    <Stack.Screen
                        name="SoapNoteEditor"
                    >
                        {(props) => {
                            const SoapNoteEditor = require('../features/therapist/screens/SoapNoteEditorScreen').default;
                            return (
                                <ErrorBoundary>
                                    <SoapNoteEditor {...props} />
                                </ErrorBoundary>
                            );
                        }}
                    </Stack.Screen>

                    {/* Admin Routes */}
                    <Stack.Screen name="PendingApprovals" component={PendingApprovalsScreen} />
                    <Stack.Screen name="TherapistReview" component={TherapistReviewScreen} />
                    <Stack.Screen name="ManageAdmins" component={ManageAdminsScreen} />
                    <Stack.Screen
                        name="CreateAdmin"
                        component={CreateAdminModal}
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen name="AdminTherapists" component={AdminTherapistsScreen} />
                    <Stack.Screen name="AdminPatients" component={AdminPatientsScreen} />

                    {/* Therapist Specific Routes */}
                    <Stack.Screen name="PatientDiscovery" component={PatientDiscoveryScreen} />
                    <Stack.Screen name="ReferPatient" component={ReferPatientScreen} />
                    <Stack.Screen name="ReferralsManagement" component={ReferralManagementScreen} />
                    <Stack.Screen name="PatientOnboarding" component={PatientOnboardingScreen} />
                    <Stack.Screen name="PendingTherapistRequests" component={PendingTherapistRequestsScreen} />

                    {/* Payment & Video Flow */}
                    <Stack.Screen name="PaymentCheckout">
                        {() => <ErrorBoundary><PaymentCheckoutScreen /></ErrorBoundary>}
                    </Stack.Screen>
                    <Stack.Screen
                        name="UPIPaymentProcessing"
                        options={{ gestureEnabled: false, headerShown: false }}
                    >
                        {() => (
                            <ErrorBoundary>
                                <UPIPaymentProcessingScreen />
                            </ErrorBoundary>
                        )}
                    </Stack.Screen>
                    <Stack.Screen
                        name="PaymentSuccess"
                        options={{ gestureEnabled: false, headerShown: false }}
                    >
                        {() => (
                            <ErrorBoundary>
                                <PaymentSuccessScreen />
                            </ErrorBoundary>
                        )}
                    </Stack.Screen>
                    <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />

                    {/* Video Call Flow */}
                    <Stack.Screen
                        name="VideoCallWaitingRoom"
                        component={VideoCallWaitingRoomScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="VideoCall"
                        options={{ headerShown: false, gestureEnabled: false }}
                    >
                        {() => <ErrorBoundary><VideoCallScreen /></ErrorBoundary>}
                    </Stack.Screen>
                    <Stack.Screen
                        name="PostSessionFeedback"
                        component={PostSessionFeedbackScreen}
                        options={{ gestureEnabled: false }}
                    />

                    {/* Therapist Earnings */}
                    <Stack.Screen name="TherapistPaymentDashboard" component={TherapistPaymentDashboardScreen} />
                    <Stack.Screen name="Resources" component={ResourcesScreen} />
                    <Stack.Screen name="CrisisResources" component={CrisisResourcesScreen} />
                    <Stack.Screen name="RollbarDebug" component={require('../features/debug/screens/RollbarDebugScreen').default} />
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
    );
};
