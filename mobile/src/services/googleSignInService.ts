// src/services/googleSignInService.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_OAUTH_CLIENT_ID } from '@env';
import { reportError } from './rollbar';

const GOOGLE_CLIENT_ID = GOOGLE_OAUTH_CLIENT_ID;

export const initializeGoogleSignIn = async () => {
    try {
        GoogleSignin.configure({
            webClientId: GOOGLE_CLIENT_ID,
            iosClientId: GOOGLE_CLIENT_ID,
            scopes: [
                'https://www.googleapis.com/auth/meetings.space.created',
                'https://www.googleapis.com/auth/meetings.space.settings',
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
            ],
        });
    } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        reportError(error, 'GoogleSignInService:initialize');
    }
};

export const signInWithGoogle = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        try {
            await GoogleSignin.signOut(); // Force sign-out to ensure we ask for new permissions
        } catch (ignored) { }

        const response = await GoogleSignin.signIn();

        if (response.data) {
            const tokens = await GoogleSignin.getTokens();
            await AsyncStorage.setItem(
                'google_access_token',
                tokens.accessToken
            );

            return {
                user: response.data.user,
                accessToken: tokens.accessToken,
            };
        }
        return null;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        reportError(error, 'GoogleSignInService:signIn');
        throw error;
    }
};

export const getStoredAccessToken = async () => {
    return await AsyncStorage.getItem('google_access_token');
};

export const signOutGoogle = async () => {
    try {
        await GoogleSignin.signOut();
        await AsyncStorage.removeItem('google_access_token');
    } catch (error) {
        console.error('Error signing out:', error);
        reportError(error, 'GoogleSignInService:signOut');
    }
};
