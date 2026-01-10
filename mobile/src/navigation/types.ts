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
    Mentors: undefined;
    Appointments: undefined;
    Messages: undefined;
    Profile: undefined;
};

export type MentorTabParamList = {
    Home: undefined;
    Mentees: undefined;
    Sessions: undefined;
    Profile: undefined;
    Settings: undefined;
};

export type AdminTabParamList = {
    Dashboard: undefined;
    Mentors: undefined;
    Mentees: undefined;
    Admins: undefined;
    Settings: undefined;
};

export type RootStackParamList = {
    AppLoading: undefined;
    Onboarding: { screen: keyof OnboardingStackParamList } | undefined;
    Auth: { screen: keyof AuthStackParamList } | undefined;
    Main: { screen: keyof MainTabParamList } | undefined;
    MentorMain: { screen: keyof MentorTabParamList } | undefined;
    AdminMain: { screen: keyof AdminTabParamList } | undefined;

    // Appointment Flow
    SelectDate: { mentorId: string; mentorName: string; mentorAvatar?: string; mentorBio?: string; mentorExpertise?: string[] };
    ChooseTime: { mentorId: string; mentorName: string; mentorAvatar?: string; selectedDate: string; selectedTime?: string; selectedTimeEnd?: string };
    ConfirmAppointment: { mentorId: string; mentorName: string; mentorAvatar?: string; selectedDate: string; selectedTime: string; selectedTimeEnd: string; notes?: string };

    // Payment Flow
    PaymentCheckout: {
        appointmentId: string;
        mentorId: string;
        mentorName: string;
        mentorAvatar?: string;
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
        mentorId?: string;
    };

    // Shared
    ChatDetail: { otherUserId: string; otherUserName: string };
    Settings: undefined;
    EditProfile: undefined;
    Notifications: undefined;

    // Mentor/Mentee Details
    MentorDetail: { mentorId: string; mentorName: string; mentorAvatar?: string; mentorBio?: string; mentorExpertise?: string[] };
    MenteeDetail: { menteeId: string; menteeName: string; menteeAvatar?: string };
    SessionDetail: { appointmentId: string };
    AddNote: { menteeId: string };
    AddGoal: { menteeId: string };

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
    MentorReview: { mentor: Profile };
    ManageAdmins: undefined;
    CreateAdmin: undefined;
    AdminMentors: undefined;
    AdminMentees: undefined;

    // Mentor Screens
    MenteeDiscovery: { autoOpenAddModal?: boolean } | undefined;

    PendingMentorRequests: undefined;

    ReferMentee: { menteeId: string };
    ReferralsManagement: undefined;
    MenteeOnboarding: { menteeId?: string };
    MentorPaymentDashboard: undefined;
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
