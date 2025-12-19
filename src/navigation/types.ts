import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { Profile } from '../api/types';

export type AuthStackParamList = {
    Login: undefined;
    SignUp: undefined;
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
};

export type AdminTabParamList = {
    Dashboard: undefined;
    Mentors: undefined;
    Mentees: undefined;
    Admins: undefined;
    Settings: undefined;
};

export type RootStackParamList = {
    Onboarding: { screen: keyof OnboardingStackParamList } | undefined;
    Auth: { screen: keyof AuthStackParamList } | undefined;
    Main: { screen: keyof MainTabParamList } | undefined;
    MentorMain: { screen: keyof MentorTabParamList } | undefined;
    AdminMain: { screen: keyof AdminTabParamList } | undefined;

    // Appointment Flow
    SelectDate: { mentorId: string; mentorName: string; mentorAvatar?: string; mentorBio?: string; mentorExpertise?: string[] };
    ChooseTime: { mentorId: string; mentorName: string; mentorAvatar?: string; selectedDate: string; selectedTime?: string; selectedTimeEnd?: string };
    ConfirmAppointment: { mentorId: string; mentorName: string; mentorAvatar?: string; selectedDate: string; selectedTime: string; selectedTimeEnd: string; notes?: string };

    // Shared
    ChatDetail: { otherUserId: string; otherUserName: string };
    Settings: undefined;

    // Mentor/Mentee Details
    MentorDetail: { mentorId: string; mentorName: string; mentorAvatar?: string; mentorBio?: string; mentorExpertise?: string[] };
    MenteeDetail: { menteeId: string; menteeName: string; menteeAvatar?: string };
    SessionDetail: { appointmentId: string };
    AddNote: { menteeId: string };
    AddGoal: { menteeId: string };

    // AI Scribe
    TranscriptViewer: { transcriptId: string; appointmentId?: string };
    SoapNoteEditor: { soapNoteId: string; appointmentId: string; transcriptId?: string };

    // Admin Screens
    PendingApproval: undefined; // For pending message
    PendingApprovals: undefined; // Admin list
    MentorReview: { mentor: Profile };
    ManageAdmins: undefined;
    CreateAdmin: undefined;
    AdminMentors: undefined;
    AdminMentees: undefined;

    // Mentor Screens
    MenteeDiscovery: undefined;

    PendingMentorRequests: undefined;

    ReferMentee: { menteeId: string };
    ReferralsManagement: undefined;
    MenteeOnboarding: { menteeId?: string };
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
