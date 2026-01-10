
import * as Linking from 'expo-linking';
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

const prefix = Linking.createURL('/');

export const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [prefix, 'safespace://', 'https://safespace.app'],
    config: {
        screens: {
            Main: {
                initialRouteName: 'Home',
                screens: {
                    Home: 'home',
                    Therapists: 'therapists',
                    Appointments: 'appointments',
                    Messages: 'messages',
                    Profile: 'profile',
                },
            },
            TherapistMain: {
                initialRouteName: 'Home',
                screens: {
                    Home: 'therapist/home',
                    Patients: 'therapist/patients',
                    Sessions: 'therapist/sessions',
                    Profile: 'therapist/profile',
                    Settings: 'therapist/settings',
                },
            },
            ChatDetail: 'chat/:otherUserId/:otherUserName',
            VideoCallWaitingRoom: 'video/:appointmentId',
            PaymentCheckout: 'payment/:appointmentId',
            PatientDetail: 'patient/:patientId',
            TherapistDetail: 'therapist/:therapistId',
            Auth: {
                screens: {
                    Login: 'login',
                    SignUp: 'signup',
                },
            },
        },
    },
};
