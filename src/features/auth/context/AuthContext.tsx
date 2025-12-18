import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../api/supabase';
import { Profile } from '../../../api/types';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    role: 'mentor' | 'mentee' | 'admin' | null;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isMentor: boolean;
    isMentee: boolean;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    role: null,
    isAdmin: false,
    isSuperAdmin: false,
    isMentor: false,
    isMentee: false,
    loading: true,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => { },
    signInWithGoogle: async () => { },
    refreshProfile: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [role, setRole] = useState<'mentor' | 'mentee' | 'admin' | null>(null);
    const [loading, setLoading] = useState(true);

    const isAdmin = role === 'admin';
    const isSuperAdmin = !!profile?.is_super_admin;
    const isMentor = role === 'mentor';
    const isMentee = role === 'mentee';

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (data && !error) {
            setProfile(data as Profile);
            setRole(data.role as any);
            await AsyncStorage.setItem('userRole', data.role);
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
        }
    };

    const checkAndCreateProfile = async (session: Session) => {
        console.log('checkAndCreateProfile: start', session?.user?.id);
        if (!session?.user) return;

        const currentProfile = await fetchProfile(session.user.id);
        console.log('checkAndCreateProfile: fetched profile', !!currentProfile);

        if (!currentProfile) {
            console.log('checkAndCreateProfile: creating profile...');
            // Profile doesn't exist, create it
            // Default to mentee if not specified in metadata
            const role = session.user.user_metadata.role || 'mentee';
            const approvalStatus = role === 'mentor' ? 'pending' : null;

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
            } else {
                console.log('checkAndCreateProfile: profile created, fetching...');
                await fetchProfile(session.user.id);
            }
        }
        console.log('checkAndCreateProfile: done');
    };

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('onAuthStateChange:', event);
            setSession(session);
            setUser(session?.user ?? null);

            try {
                if (session?.user) {
                    // Timeout checkAndCreateProfile to prevent infinite hanging (e.g., 10s)
                    const profilePromise = checkAndCreateProfile(session);
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile check timed out')), 10000));
                    await Promise.race([profilePromise, timeoutPromise]);
                } else {
                    setProfile(null);
                    setRole(null);
                }
            } catch (error) {
                console.error('Error during auth state change profile check:', error);
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
                    // Timeout checkAndCreateProfile
                    const profilePromise = checkAndCreateProfile(session);
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile check timed out')), 10000));
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
        const approvalStatus = userData.role === 'mentor' ? 'pending' : null;

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
        await supabase.auth.signOut();
        await AsyncStorage.removeItem('userRole');
        setProfile(null);
        setRole(null);
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
            isMentor,
            isMentee,
            loading,
            signIn,
            signUp,
            signOut,
            signInWithGoogle,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
