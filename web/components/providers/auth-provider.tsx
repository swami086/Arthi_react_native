'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { setRollbarUser, clearRollbarUser, addBreadcrumb, reportError } from '@/lib/rollbar-utils';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    role: 'therapist' | 'patient' | 'admin' | null;
    isLoading: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isTherapist: boolean;
    isPatient: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code !== 'PGRST116') { // Ignore "not found" record
                    reportError(error, 'AuthProvider.fetchProfile', { userId });
                }
                return null;
            }
            return data;
        } catch (error) {
            reportError(error, 'AuthProvider.fetchProfile.catch', { userId });
            return null;
        }
    };

    const refreshProfile = async () => {
        if (user) {
            const updatedProfile = await fetchProfile(user.id);
            setProfile(updatedProfile);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const initialUser = session?.user ?? null;
                setUser(initialUser);

                if (initialUser) {
                    addBreadcrumb('Auth initialized with session', 'auth', 'info', { userId: initialUser.id });
                    setRollbarUser(initialUser.id, initialUser.email);
                    const userProfile = await fetchProfile(initialUser.id);
                    setProfile(userProfile);
                } else {
                    addBreadcrumb('Auth initialized without session', 'auth', 'info');
                    clearRollbarUser();
                }
            } catch (error) {
                reportError(error, 'AuthProvider.initializeAuth');
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            addBreadcrumb(`Auth state changed: ${event}`, 'auth', 'info', {
                userId: currentUser?.id,
                event
            });

            if (currentUser) {
                setRollbarUser(currentUser.id, currentUser.email);
                const userProfile = await fetchProfile(currentUser.id);
                setProfile(userProfile);
            } else {
                setProfile(null);
                clearRollbarUser();
            }

            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const role = profile?.role as any || null;
    const isAdmin = role === 'admin';
    const isSuperAdmin = isAdmin; // Logic can be updated if superadmin exists
    const isTherapist = role === 'therapist';
    const isPatient = role === 'patient';

    const value = {
        user,
        profile,
        role,
        isLoading,
        isAdmin,
        isSuperAdmin,
        isTherapist,
        isPatient,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
