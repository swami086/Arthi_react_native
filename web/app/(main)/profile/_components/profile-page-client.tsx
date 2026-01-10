'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Settings, Edit, MessageSquare, ChevronRight, Plus, Calendar } from 'lucide-react';
import { GradientAvatar } from '@/components/ui/gradient-avatar';
import { TagPill } from '@/components/ui/tag-pill';
import { Button } from '@/components/ui/button';
import { useMyTherapists } from '@/hooks/use-my-therapists';
import { scaleIn, slideUp, staggerContainer } from '@/lib/animation-variants';
import { format } from 'date-fns';
import { addBreadcrumb } from '@/lib/rollbar-utils';

interface ProfilePageClientProps {
    user: any;
    profile: any;
    upcomingAppointment: any;
    therapists: any[];
    stats: {
        totalSessions: number;
        activeTherapists: number;
        upcomingSessions: number;
    };
}

export default function ProfilePageClient({
    user,
    profile,
    upcomingAppointment,
    therapists: initialTherapists,
    stats
}: ProfilePageClientProps) {
    const router = useRouter();
    const { therapists } = useMyTherapists(user.id); // Real-time therapists

    // Use initial data if real-time hasn't loaded yet
    const displayTherapists = therapists.length > 0 ? therapists : initialTherapists;

    const handleEditProfile = () => {
        addBreadcrumb('Navigating to edit profile', 'profile', 'info');
        router.push('/profile/edit');
    };

    const handleSettings = () => {
        addBreadcrumb('Navigating to settings', 'profile', 'info');
        router.push('/profile/settings');
    };

    return (
        <motion.div
            className="max-w-4xl mx-auto px-6 py-8 space-y-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">{profile?.full_name || 'My Profile'}</h1>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
                            {profile?.role || 'User'}
                        </span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSettings}>
                    <Settings className="h-6 w-6 text-gray-500" />
                </Button>
            </div>

            {/* Avatar Section */}
            <motion.div variants={scaleIn} className="flex flex-col items-center justify-center space-y-4">
                <div className="relative group cursor-pointer" onClick={handleEditProfile}>
                    <GradientAvatar
                        src={profile?.avatar_url || 'https://via.placeholder.com/150'}
                        alt={profile?.full_name || 'Profile'}
                        size={110}
                        online={profile?.is_available || false}
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Edit className="text-white h-8 w-8" />
                    </div>
                </div>
            </motion.div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Sessions', value: stats.totalSessions },
                    { label: 'Therapists', value: stats.activeTherapists },
                    { label: 'Upcoming', value: stats.upcomingSessions }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={slideUp}
                        className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center"
                    >
                        <span className="text-xl font-bold">{stat.value}</span>
                        <span className="text-xs text-gray-500 uppercase">{stat.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Upcoming Session Card */}
            {upcomingAppointment ? (
                <motion.div
                    variants={scaleIn}
                    className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #30bae8 0%, #9055ff 100%)' }}
                >
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white/80">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">Upcoming Session</span>
                            </div>
                            <h2 className="text-xl font-bold">
                                {format(new Date(upcomingAppointment.start_time), 'EEEE, MMM do • h:mm a')}
                            </h2>
                            <p className="text-white/90">With {upcomingAppointment.therapist?.full_name}</p>
                        </div>
                        <Button
                            className="bg-white text-blue-600 hover:bg-white/90 font-bold rounded-full px-6"
                            onClick={() => router.push(`/appointments/${upcomingAppointment.id}`)}
                        >
                            Join Waiting Room
                        </Button>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    variants={slideUp}
                    className="bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-8 flex flex-col items-center text-center space-y-4"
                >
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm">
                        <Calendar className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-gray-600 dark:text-gray-400">No upcoming sessions</p>
                        <p className="text-sm text-gray-500">Book your next session to stay on track</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/therapists')}>Find a Therapist</Button>
                </motion.div>
            )}

            {/* Focus Areas */}
            <motion.div variants={slideUp} className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Focus Areas</h3>
                    <Button variant="ghost" size="sm" className="text-blue-600 text-xs font-bold gap-1">
                        <Plus className="h-3 w-3" /> Add
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {profile?.expertise_areas && profile.expertise_areas.length > 0 ? (
                        profile.expertise_areas.map((area: string, index: number) => (
                            <TagPill
                                key={index}
                                label={area}
                                color={['blue', 'purple', 'orange', 'green'][index % 4] as 'blue' | 'purple' | 'orange' | 'green'}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 italic">No expertise areas specified</p>
                    )}
                </div>
            </motion.div>

            {/* My Therapists */}
            <motion.div variants={slideUp} className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">My Therapists</h3>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                    {displayTherapists.length > 0 ? (
                        displayTherapists.map((rel, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <GradientAvatar
                                        src={rel.therapist?.avatar_url || 'https://via.placeholder.com/150'}
                                        alt={rel.therapist?.full_name || 'Therapist'}
                                        size={48}
                                    />
                                    <div className="min-w-0">
                                        <p className="font-bold truncate">{rel.therapist?.full_name}</p>
                                        <p className="text-xs text-gray-500 truncate">{rel.therapist?.specialization}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="flex-1 bg-gray-50 dark:bg-gray-900 border text-xs gap-1">
                                        <MessageSquare className="h-3.5 w-3.5" /> Chat
                                    </Button>
                                    <Button variant="ghost" size="sm" className="bg-gray-50 dark:bg-gray-900 border" onClick={() => router.push(`/therapists/${rel.therapist_id}`)}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 italic">No active therapists found</p>
                    )}
                </div>
            </motion.div>

            {/* Bio Section */}
            <motion.div variants={slideUp} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">About Me</h3>
                    <Button variant="ghost" size="sm" onClick={handleEditProfile} className="text-gray-400">
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {profile?.bio || 'Write something about yourself...'}
                </p>
            </motion.div>
        </motion.div>
    );
}
