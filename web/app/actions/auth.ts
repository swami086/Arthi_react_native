'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { withErrorHandling } from '@/lib/server-action-wrapper';

export const signInWithEmail = withErrorHandling(
    'auth.signIn',
    async (formData: { email: string; password: string }) => {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });

        if (error || !data.user) {
            throw new Error(error?.message || 'Invalid credentials');
        }

        const userId = data.user.id;

        // Fetch profile to determine redirect
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, approval_status')
            .eq('user_id', userId)
            .single();

        const userProfile = profile as { role: string; approval_status: string | null } | null;

        if (userProfile?.role === 'mentor' && userProfile?.approval_status === 'pending') {
            redirect('/pending-approval');
        } else if (userProfile?.role === 'mentor') {
            redirect('/mentor/home');
        } else if (userProfile?.role === 'admin') {
            redirect('/admin/dashboard');
        } else if (userProfile?.role === 'mentee') {
            redirect('/home');
        }

        revalidatePath('/', 'layout');
        return true;
    }
);

export const signUpWithEmail = withErrorHandling(
    'auth.signUp',
    async (
        email: string,
        password: string,
        userData: { fullName: string; role: 'mentor' | 'mentee' }
    ) => {
        const supabase = await createClient();

        // Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: userData.fullName,
                    role: userData.role,
                },
            },
        });

        if (authError) {
            throw new Error(authError.message);
        }

        if (!authData.user) {
            throw new Error('Failed to create user account');
        }

        // Create profile
        const { error: profileError } = await (supabase.from('profiles') as any)
            .insert({
                user_id: authData.user.id,
                full_name: userData.fullName,
                role: userData.role,
                approval_status: userData.role === 'mentor' ? 'pending' : null,
            });

        if (profileError) {
            // Note: We don't rollback user creation here, but we fail the action
            // In a real app we might want to delete the user or use a transaction
            throw new Error('Failed to create user profile');
        }

        if (userData.role === 'mentor') {
            redirect('/pending-approval');
        } else {
            redirect('/home');
        }

        revalidatePath('/', 'layout');
        return true;
    }
);

export const signOut = withErrorHandling(
    'auth.signOut',
    async () => {
        const supabase = await createClient();
        await supabase.auth.signOut();
        revalidatePath('/', 'layout');
        redirect('/login');
        return true;
    }
);

export const resetPassword = withErrorHandling(
    'auth.resetPassword',
    async (email: string) => {
        const supabase = await createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
        });

        if (error) {
            throw new Error(error.message);
        }

        return true;
    }
);

export const signInWithGoogle = withErrorHandling(
    'auth.signInWithGoogle',
    async () => {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            },
        });

        if (error) {
            throw new Error(error.message);
        }

        if (data.url) {
            redirect(data.url);
        }

        throw new Error('Failed to initiate Google sign-in');
    }
);

export const getUserProfile = withErrorHandling(
    'auth.getUserProfile',
    async (userId: string) => {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    }
);
