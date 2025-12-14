import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../../api/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => { },
    signInWithGoogle: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

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

            // Note: On mobile, OAuth usually involves a redirect URL. 
            // The session might not be available immediately here if it redirects the app.
            // However, we can listen to auth state changes to handle profile creation.
        } catch (error) {
            console.error("Google Sign In Error:", error);
        }
    };

    useEffect(() => {
        // Listen for auth state changes to ensure profile exists
        const checkAndCreateProfile = async (session: Session) => {
            if (!session?.user) return;

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (!profile && !error) {
                // Profile doesn't exist, create it
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        user_id: session.user.id,
                        role: 'mentee', // Default role
                        full_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
                        avatar_url: session.user.user_metadata.avatar_url,
                        created_at: new Date().toISOString(),
                    });

                if (insertError) console.error('Error creating profile for Google user:', insertError);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (event === 'SIGNED_IN' && session) {
                await checkAndCreateProfile(session);
            }
        });

        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            if (session) checkAndCreateProfile(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        // We don't set global loading=true here to avoid unmounting the whole app if it depends on loading state for navigation
        // But individual components can use local loading state.
        // However, if we want to block UI, we can.
        // The context defines loading generally for initial auth check.

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUp = async (email: string, password: string, userData: any) => {
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

        if (user && !error) {
            // Create profile in profiles table
            // Note: Triggers are often better for this, but plan explicitly says "On successful signup, create profile in profiles table"
            const { error: profileError } = await supabase.from('profiles').insert({
                user_id: user.id,
                role: userData.role,
                full_name: userData.fullName,
                created_at: new Date().toISOString(),
            });

            if (profileError) {
                console.error('Error creating profile:', profileError);
                // If profile creation fails, we might want to sign out or delete user, but for now just return error
                return { error: profileError };
            }
        }

        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, signInWithGoogle }}>
            {children}
        </AuthContext.Provider>
    );
};
