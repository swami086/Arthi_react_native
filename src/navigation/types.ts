import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

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

export type RootStackParamList = {
    Onboarding: { screen: keyof OnboardingStackParamList } | undefined;
    Auth: { screen: keyof AuthStackParamList } | undefined;
    Main: { screen: keyof MainTabParamList } | undefined;
    Booking: { mentorId: string; mentorName: string };
    ChatDetail: { otherUserId: string; otherUserName: string };
};

export type RootNavigationProp = StackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>;
export type OnboardingNavigationProp = StackNavigationProp<OnboardingStackParamList & RootStackParamList>;
export type MainTabCompositeProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    StackNavigationProp<RootStackParamList>
>;
