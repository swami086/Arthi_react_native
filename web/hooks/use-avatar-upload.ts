'use client';

import { useState } from 'react';
import { uploadAvatar as uploadAvatarAction, deleteAvatar as deleteAvatarAction } from '@/app/actions/profile';
import { toast } from 'sonner';

export function useAvatarUpload(userId: string) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadAvatar = async (file: File) => {
        // Validation
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return { success: false, error: 'File too large' };
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only JPEG, PNG and WebP images are allowed');
            return { success: false, error: 'Invalid file type' };
        }

        try {
            setUploading(true);
            setProgress(10); // Start progress

            const formData = new FormData();
            formData.append('file', file);

            setProgress(30);

            const { data, error } = await uploadAvatarAction(userId, formData);

            if (error) throw new Error(error);

            setProgress(100);
            toast.success('Avatar uploaded successfully');
            return { success: true, url: data };
        } catch (err: any) {
            toast.error(err.message || 'Failed to upload avatar');
            return { success: false, error: err.message };
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    const deleteAvatar = async () => {
        if (!confirm('Are you sure you want to remove your profile picture?')) {
            return { success: false };
        }

        try {
            setUploading(true);
            const { success, error } = await deleteAvatarAction(userId);
            if (error) throw new Error(error);

            toast.success('Avatar removed');
            return { success: true };
        } catch (err: any) {
            toast.error(err.message || 'Failed to remove avatar');
            return { success: false, error: err.message };
        } finally {
            setUploading(false);
        }
    };

    return {
        uploading,
        progress,
        uploadAvatar,
        deleteAvatar,
    };
}
