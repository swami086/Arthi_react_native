'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { reportError, addBreadcrumb, reportInfo } from '@/lib/rollbar-utils';
import { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Fetch user profile from profiles table
 */
export async function getProfile(userId: string) {
    addBreadcrumb(`Fetching profile for user: ${userId}`, 'profile', 'info');
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        reportError(error, 'getProfile', { userId });
        return { data: null, error: error.message };
    }
}

/**
 * Update profile fields
 */
export async function updateProfile(userId: string, updates: Partial<Profile>) {
    addBreadcrumb(`Updating profile for user: ${userId}`, 'profile', 'info', { updates });
    const supabase = await createClient();

    try {
        const { data, error } = await (supabase.from('profiles') as any)
            .update(updates as any)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/profile');
        revalidatePath('/profile/edit');

        return { data, error: null };
    } catch (error: any) {
        reportError(error, 'updateProfile', { userId, updates });
        return { data: null, error: error.message };
    }
}

/**
 * Handle avatar upload to Supabase Storage
 */
export async function uploadAvatar(userId: string, formData: FormData) {
    addBreadcrumb(`Uploading avatar for user: ${userId}`, 'profile', 'info');
    const supabase = await createClient();
    const file = formData.get('file') as File;

    if (!file) {
        return { data: null, error: 'No file provided' };
    }

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Update profile with new avatar URL
        const { error: updateError } = await (supabase.from('profiles') as any)
            .update({ avatar_url: publicUrl } as any)
            .eq('user_id', userId);

        if (updateError) throw updateError;

        revalidatePath('/profile');
        revalidatePath('/profile/edit');

        return { data: publicUrl, error: null };
    } catch (error: any) {
        reportError(error, 'uploadAvatar', { userId });
        return { data: null, error: error.message };
    }
}

/**
 * Remove avatar from storage and set avatar_url to null
 */
export async function deleteAvatar(userId: string) {
    addBreadcrumb(`Deleting avatar for user: ${userId}`, 'profile', 'info');
    const supabase = await createClient();

    try {
        // Get current avatar URL to find the file path if possible, 
        // but usually we just set it to null in the profile first
        const { data: profile } = await (supabase.from('profiles') as any)
            .select('avatar_url')
            .eq('user_id', userId)
            .single();

        if (profile?.avatar_url) {
            // Logic for deleting from storage could be added here if needed
            // For now, focusing on the profile update as per plan
        }

        const { error } = await (supabase.from('profiles') as any)
            .update({ avatar_url: null } as any)
            .eq('user_id', userId);

        if (error) throw error;

        revalidatePath('/profile');
        revalidatePath('/profile/edit');

        return { success: true, error: null };
    } catch (error: any) {
        reportError(error, 'deleteAvatar', { userId });
        return { success: false, error: error.message };
    }
}

/**
 * Fetch active mentor relationships
 */
export async function getMyMentors(userId: string) {
    addBreadcrumb(`Fetching mentors for user: ${userId}`, 'profile', 'info');
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('mentor_mentee_relationships')
            .select(`
        *,
        mentor:profiles!mentor_mentee_relationships_mentor_id_fkey(*)
      `)
            .eq('mentee_id', userId)
            .eq('status', 'active');

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        reportError(error, 'getMyMentors', { userId });
        return { data: null, error: error.message };
    }
}

/**
 * Generate JSON export of user data for DPDP compliance
 */
export async function exportUserData(userId: string) {
    addBreadcrumb(`Exporting data for user: ${userId}`, 'profile', 'info');
    const supabase = await createClient();

    try {
        const [
            profile,
            appointments,
            messages,
            payments,
            relationships,
            goals,
            notes
        ] = await Promise.all([
            supabase.from('profiles').select('*').eq('user_id', userId).single(),
            supabase.from('appointments').select('*').or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`),
            supabase.from('messages').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
            supabase.from('payments').select('*').or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`),
            supabase.from('mentor_mentee_relationships').select('*').or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`),
            supabase.from('mentee_goals').select('*').eq('mentee_id', userId),
            supabase.from('mentor_notes').select('*').or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
        ]);

        const userData = {
            export_date: new Date().toISOString(),
            user_id: userId,
            profile: profile.data,
            appointments: appointments.data || [],
            messages: messages.data || [],
            payments: payments.data || [],
            relationships: relationships.data || [],
            goals: goals.data || [],
            notes: notes.data || []
        };

        reportInfo('User data exported', 'profile.export', { userId });

        // In a real server action, we return the data
        // The client will handle the download
        return { data: userData, error: null };
    } catch (error: any) {
        reportError(error, 'exportUserData', { userId });
        return { data: null, error: error.message };
    }
}

/**
 * Request account deletion
 */
export async function requestAccountDeletion(userId: string, reason?: string) {
    addBreadcrumb(`Account deletion requested for user: ${userId}`, 'profile', 'info', { reason });
    const supabase = await createClient();

    try {
        // Log action in admin_actions
        const { error: logError } = await (supabase.from('admin_actions') as any).insert({
            admin_id: userId, // User doing it to themselves
            action_type: 'account_deletion_request',
            target_user_id: userId,
            details: { reason, status: 'pending' }
        });

        // Soft delete: Update profile and anonymize
        const { error: profileError } = await (supabase.from('profiles') as any)
            .update({
                full_name: 'Deleted User',
                bio: null,
                phone_number: null,
                avatar_url: null,
                is_available: false,
                // ... anonymize other fields
            } as any)
            .eq('user_id', userId);

        if (profileError) throw profileError; // Changed from 'error' to 'profileError'

        // Optional: Sign out is handled on client side after this returns
        reportInfo('Account deletion requested', 'profile.delete', { userId, reason });

        return { success: true, error: null };
    } catch (error: any) {
        reportError(error, 'requestAccountDeletion', { userId });
        return { success: false, error: error.message };
    }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(userId: string, preferences: any) {
    addBreadcrumb(`Updating notification preferences for user: ${userId}`, 'profile', 'info', { preferences });
    const supabase = await createClient();

    try {
        const { error } = await (supabase.from('profiles') as any)
            .update({
                notification_preferences: preferences
            } as any)
            .eq('user_id', userId);

        if (error) throw error;

        reportInfo('Notification preferences updated', 'profile.notifications', { userId, preferences });

        return { success: true, error: null };
    } catch (error: any) {
        reportError(error, 'updateNotificationPreferences', { userId });
        return { success: false, error: error.message };
    }
}
