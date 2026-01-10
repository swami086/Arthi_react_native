import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../api/supabase';
import { Profile } from '../../../api/types';
import { reportError, setRollbarUser, clearRollbarUser, resetTraceId, reportInfo, getTraceId } from '../../../services/rollbar';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    role: 'therapist' | 'patient' | 'admin' | null;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isTherapist: boolean;
    isPatient: boolean;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: any }>;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    role: null,
    isAdmin: false,
    isSuperAdmin: false,
    isTherapist: false,
    isPatient: false,
    loading: true,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => { },
    signInWithGoogle: async () => { },
    refreshProfile: async () => { },
    resetPassword: async () => ({ error: null }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [role, setRole] = useState<'therapist' | 'patient' | 'admin' | null>(null);
    const [loading, setLoading] = useState(true);
    const processingUserId = React.useRef<string | null>(null);

    const isAdmin = role === 'admin';
    const isSuperAdmin = !!profile?.is_super_admin;
    const isTherapist = role === 'therapist';
    const isPatient = role === 'patient';

    const fetchProfile = async (userId: string) => {
        console.log('fetchProfile: fetching for', userId);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('fetchProfile: error', error);
            reportError(error, 'AuthContext:fetchProfile');
        }

        if (data && !error) {
            console.log('fetchProfile: success', data.role);
            setProfile(data as Profile);
            setRole(data.role as any);
            try {
                await AsyncStorage.setItem('userRole', data.role);
            } catch (storageError) {
                console.error('fetchProfile: storage error', storageError);
            }
        }
        return data as Profile;
    };

    const signInWithGoogle = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error("Google Sign In Error:", error);
            reportError(error, 'AuthContext:signInWithGoogle');
        }
    };

    const checkAndCreateProfile = async (session: Session) => {
        if (!session?.user || processingUserId.current === session.user.id) {
            console.log('checkAndCreateProfile: already processing or no user', session?.user?.id);
            return;
        }

        try {
            processingUserId.current = session.user.id;
            console.log('checkAndCreateProfile: start', session.user.id);

            const currentProfile = await fetchProfile(session.user.id);
            console.log('checkAndCreateProfile: fetched profile', !!currentProfile);

            if (!currentProfile) {
                console.log('checkAndCreateProfile: creating profile...');
                // ... (rest of logic)
                const role = session.user.user_metadata.role || 'patient';
                const approvalStatus = role === 'therapist' ? 'pending' : null;

                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        user_id: session.user.id,
                        role: role,
                        full_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
                        avatar_url: session.user.user_metadata.avatar_url,
                        approval_status: approvalStatus,
                        created_at: new Date().toISOString(),
                    });

                if (insertError) {
                    console.error('Error creating profile for Google user:', insertError);
                    reportError(insertError, 'AuthContext:checkAndCreateProfile:insert');
                } else {
                    console.log('checkAndCreateProfile: profile created, fetching...');
                    await fetchProfile(session.user.id);
                }
            }
        } finally {
            processingUserId.current = null;
            console.log('checkAndCreateProfile: done', session.user.id);
        }
    };

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('onAuthStateChange:', event);
            setSession(session);
            setUser(session?.user ?? null);

            // Zipy integration removed
            if (session?.user) {
                // Reset trace ID on login for a fresh session
                if (event === 'SIGNED_IN') {
                    resetTraceId();
                    reportInfo('User signed in', 'AuthContext:onAuthStateChange', {
                        user_id: session.user.id,
                        trace_id: getTraceId()
                    });
                }
            }

            try {
                if (session?.user) {
                    // Increased timeout to 30s for slower connections
                    const profilePromise = checkAndCreateProfile(session);
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile check timed out (60s)')), 60000));
                    await Promise.race([profilePromise, timeoutPromise]);

                    // Set Rollbar user context
                    if (session.user) {
                        setRollbarUser(
                            session.user.id,
                            session.user.email,
                            session.user.user_metadata?.full_name,
                            {
                                role: session.user.user_metadata?.role,
                                trace_id: getTraceId()
                            }
                        );
                    }
                } else {
                    setProfile(null);
                    setRole(null);
                }
            } catch (error) {
                // console.warn('Warning during auth state change profile check:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
                reportError(error, 'AuthContext:onAuthStateChange');
                // Fallback: Ensure loading does not stay true forever
            } finally {
                setLoading(false);
                console.log('onAuthStateChange: loading set to false');
            }
        });

        // Initial check
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            console.log('getSession: start', !!session);
            setSession(session);
            setUser(session?.user ?? null);
            try {
                if (session?.user) {
                    // Increased timeout to 30s
                    const profilePromise = checkAndCreateProfile(session);
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile check timed out (60s)')), 60000));
                    await Promise.race([profilePromise, timeoutPromise]);
                }
            } catch (error) {
                console.error('Error during initial session profile check:', error);
            } finally {
                setLoading(false);
                console.log('getSession: loading set to false');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (data.user && !error) {
            await fetchProfile(data.user.id);
        }
        return { error };
    };

    const signUp = async (email: string, password: string, userData: any) => {
        const approvalStatus = userData.role === 'therapist' ? 'pending' : null;

        const { data: { user }, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: userData.fullName,
                    role: userData.role,
                }
            }
        });

        // Manual profile creation if trigger fails or not set up
        if (user && !error) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    user_id: user.id,
                    role: userData.role,
                    full_name: userData.fullName,
                    approval_status: approvalStatus,
                    created_at: new Date().toISOString(),
                });

            if (!profileError) {
                await AsyncStorage.setItem('userRole', userData.role);
                // We don't set profile directly here, the auth state change will trigger fetch
            }
        }

        return { error };
    };

    const signOut = async () => {
        reportInfo('User signing out', 'AuthContext:signOut', {
            user_id: user?.id,
            trace_id: getTraceId()
        });
        clearRollbarUser();
        await supabase.auth.signOut();
        await AsyncStorage.removeItem('userRole');
        setProfile(null);
        setRole(null);
        resetTraceId(); // Clear trace ID on logout
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            profile,
            role,
            isAdmin,
            isSuperAdmin,
            isTherapist,
            isPatient,
            loading,
            signIn,
            signUp,
            signOut,
            signInWithGoogle,
            refreshProfile,
            resetPassword: async (email: string) => {
                const { error } = await supabase.auth.resetPasswordForEmail(email);
                return { error };
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
