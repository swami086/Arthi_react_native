'use client';

import { useState, useCallback, useEffect } from 'react';
import { getProfile, updateProfile } from '@/app/actions/profile';
import { toast } from 'sonner';

export function useProfile(userId?: string) {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: fetchError } = await getProfile(userId);
            if (fetchError) throw new Error(fetchError);
            setProfile(data);
        } catch (err: any) {
            setError(err.message);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const handleUpdateProfile = async (updates: any) => {
        if (!userId) return;

        // Optimistic update
        const previousProfile = profile;
        setProfile((prev: any) => ({ ...prev, ...updates }));

        try {
            const { data, error: updateError } = await updateProfile(userId, updates);
            if (updateError) throw new Error(updateError);
            setProfile(data);
            toast.success('Profile updated successfully');
            return { success: true };
        } catch (err: any) {
            setProfile(previousProfile);
            toast.error(err.message || 'Failed to update profile');
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        loading,
        error,
        updateProfile: handleUpdateProfile,
        refetch: fetchProfile,
    };
}
