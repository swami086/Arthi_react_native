'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, BookOpen, Star, Camera, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { GradientAvatar } from '@/components/ui/gradient-avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/use-profile';
import { useAvatarUpload } from '@/hooks/use-avatar-upload';
import { slideUp, staggerContainer } from '@/lib/animation-variants';
import { addBreadcrumb } from '@/lib/rollbar-utils';

interface EditProfileClientProps {
    user: any;
    profile: any;
}

export default function EditProfileClient({ user, profile: initialProfile }: EditProfileClientProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { updateProfile, loading: updating } = useProfile(user.id);
    const { uploading, progress, uploadAvatar, deleteAvatar } = useAvatarUpload(user.id);
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(initialProfile?.avatar_url);

    const [formData, setFormData] = useState({
        full_name: initialProfile?.full_name || '',
        bio: initialProfile?.bio || '',
        phone_number: initialProfile?.phone_number || '',
        specialization: initialProfile?.specialization || '',
        expertise_areas: initialProfile?.expertise_areas?.join(', ') || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.full_name) newErrors.full_name = 'Full name is required';
        if (formData.full_name.length < 2) newErrors.full_name = 'Name is too short';
        if (formData.bio.length > 500) newErrors.bio = 'Bio is too long (max 500 chars)';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        addBreadcrumb('Submitting profile update', 'profile.edit', 'info');

        const updates = {
            ...formData,
            expertise_areas: formData.expertise_areas.split(',').map((s: string) => s.trim()).filter(Boolean),
        };

        const result = await updateProfile(updates);
        if (result?.success) {
            router.push('/profile');
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const result = await uploadAvatar(file);
            if (result.success && result.url) {
                setCurrentAvatarUrl(result.url);
            }
        }
    };

    const handleDeleteAvatar = async () => {
        const result = await deleteAvatar();
        if (result.success) {
            setCurrentAvatarUrl(null);
        }
    };

    return (
        <motion.div
            className="max-w-2xl mx-auto px-6 py-8 space-y-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Avatar Upload */}
                <motion.section variants={slideUp} className="flex flex-col items-center space-y-4">
                    <div className="relative group">
                        <GradientAvatar
                            src={currentAvatarUrl || 'https://via.placeholder.com/150'}
                            alt={initialProfile?.full_name || 'User'}
                            size={120}
                        />
                        {uploading && (
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                <div className="text-white text-xs font-bold">{progress}%</div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full gap-2"
                            onClick={handleAvatarClick}
                            disabled={uploading}
                        >
                            <Camera className="h-4 w-4" />
                            {uploading ? 'Uploading...' : 'Change Photo'}
                        </Button>
                        {currentAvatarUrl && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 gap-2"
                                onClick={handleDeleteAvatar}
                                disabled={uploading}
                            >
                                <Trash2 className="h-4 w-4" />
                                Remove
                            </Button>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </motion.section>

                {/* Form Fields */}
                <div className="space-y-4">
                    <motion.div variants={slideUp}>
                        <Input
                            label="Full Name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            error={errors.full_name}
                            leftIcon={User}
                            placeholder="Your full name"
                        />
                    </motion.div>

                    <motion.div variants={slideUp}>
                        <Input
                            label="Bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            error={errors.bio}
                            multiline
                            placeholder="Tell us about yourself..."
                            containerClassName="mb-1"
                        />
                        <div className="flex justify-end px-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${formData.bio.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                                {formData.bio.length} / 500
                            </span>
                        </div>
                    </motion.div>

                    <motion.div variants={slideUp}>
                        <Input
                            label="Phone Number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            error={errors.phone_number}
                            leftIcon={Phone}
                            placeholder="+1 (555) 000-0000"
                        />
                    </motion.div>

                    {initialProfile?.role === 'therapist' && (
                        <>
                            <motion.div variants={slideUp}>
                                <Input
                                    label="Specialization"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    error={errors.specialization}
                                    leftIcon={Star}
                                    placeholder="e.g. Clinical Psychology"
                                />
                            </motion.div>

                            <motion.div variants={slideUp}>
                                <Input
                                    label="Expertise Areas (comma separated)"
                                    name="expertise_areas"
                                    value={formData.expertise_areas}
                                    onChange={handleChange}
                                    error={errors.expertise_areas}
                                    leftIcon={BookOpen}
                                    placeholder="e.g. Anxiety, Depression, CBT"
                                />
                            </motion.div>
                        </>
                    )}
                </div>

                {/* Action Buttons */}
                <motion.div variants={slideUp} className="flex gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 rounded-2xl h-14 font-bold uppercase tracking-widest"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 rounded-2xl h-14 font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20"
                        disabled={updating || uploading}
                    >
                        {updating ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'Save Profile'
                        )}
                    </Button>
                </motion.div>
            </form>
        </motion.div>
    );
}
