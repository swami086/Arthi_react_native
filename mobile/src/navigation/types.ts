import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { Profile } from '../api/types';

export type AuthStackParamList = {
    Login: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
    Welcome: undefined;
    Features: undefined;
    Safety: undefined;
};


export type MainTabParamList = {
    Home: undefined;
    Therapists: undefined;
    Appointments: undefined;
    Messages: undefined;
    Profile: undefined;
};

export type TherapistTabParamList = {
    Home: undefined;
    Patients: undefined;
    Messages: undefined;
    Sessions: undefined;
    Payments: undefined;
    Referrals: undefined;
    Profile: undefined;
    Settings: undefined;
};

export type AdminTabParamList = {
    Dashboard: undefined;
    Therapists: undefined;
    Patients: undefined;
    Admins: undefined;
    Settings: undefined;
};

export type RootStackParamList = {
    AppLoading: undefined;
    Onboarding: { screen: keyof OnboardingStackParamList } | undefined;
    Auth: { screen: keyof AuthStackParamList } | undefined;
    Main: { screen: keyof MainTabParamList } | undefined;
    TherapistMain: { screen: keyof TherapistTabParamList } | undefined;
    AdminMain: { screen: keyof AdminTabParamList } | undefined;

    // Appointment Flow
    SelectDate: { therapistId: string; therapistName: string; therapistAvatar?: string; therapistBio?: string; therapistExpertise?: string[] };
    ChooseTime: { therapistId: string; therapistName: string; therapistAvatar?: string; selectedDate: string; selectedTime?: string; selectedTimeEnd?: string };
    ConfirmAppointment: { therapistId: string; therapistName: string; therapistAvatar?: string; selectedDate: string; selectedTime: string; selectedTimeEnd: string; notes?: string };

    // Payment Flow
    PaymentCheckout: {
        appointmentId: string;
        therapistId: string;
        therapistName: string;
        therapistAvatar?: string;
        amount: number;
        selectedDate: string;
        selectedTime: string;
    };
    UPIPaymentProcessing: {
        paymentId: string;
        appointmentId: string;
    };
    PaymentSuccess: {
        paymentId: string;
        appointmentId: string;
    };
    PaymentHistory: undefined;

    // Video Call Flow
    VideoCallWaitingRoom: {
        appointmentId: string;
        roomId?: string;
        googleMeetCode?: string;
    };
    VideoCall: {
        appointmentId: string;
        roomId: string;
        token?: string;
        meetingUrl: string;
        googleMeetCode: string;
    };
    PostSessionFeedback: {
        appointmentId: string;
        therapistId?: string;
    };

    // Shared
    ChatDetail: { otherUserId: string; otherUserName: string };
    Settings: undefined;
    EditProfile: undefined;
    Notifications: undefined;

    // Therapist/Patient Details
    TherapistDetail: { therapistId: string; therapistName: string; therapistAvatar?: string; therapistBio?: string; therapistExpertise?: string[] };
    PatientDetail: { patientId: string; patientName: string; patientAvatar?: string };
    SessionDetail: { appointmentId: string };
    AddNote: { patientId: string };
    AddGoal: { patientId: string };

    // Recording & SOAP Note Screens
    TranscriptViewer: {
        transcriptId: string;
        appointmentId?: string;
    };
    SoapNoteEditor: {
        soapNoteId?: string;
        appointmentId: string;
        transcriptId?: string;
    };

    // Admin Screens
    PendingApproval: undefined; // For pending message
    PendingApprovals: undefined; // Admin list
    TherapistReview: { therapist: Profile };
    ManageAdmins: undefined;
    CreateAdmin: undefined;
    AdminTherapists: undefined;
    AdminPatients: undefined;

    // Therapist Screens
    PatientDiscovery: { autoOpenAddModal?: boolean } | undefined;

    PendingTherapistRequests: undefined;

    ReferPatient: { patientId: string };
    ReferralsManagement: undefined;
    PatientOnboarding: { patientId?: string };
    TherapistPaymentDashboard: undefined;
    Resources: undefined;
    CrisisResources: undefined;
    RollbarDebug: undefined;
};

export type RootNavigationProp = StackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>;
export type OnboardingNavigationProp = StackNavigationProp<OnboardingStackParamList & RootStackParamList>;
export type MainTabCompositeProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    StackNavigationProp<RootStackParamList>
>;
export type AdminTabCompositeProp = CompositeNavigationProp<
    BottomTabNavigationProp<AdminTabParamList>,
    StackNavigationProp<RootStackParamList>
>;
