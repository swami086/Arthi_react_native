'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Search,
    Calendar,
    Bell,
    Phone,
    TrendingUp,
    Users,
    Clock,
    ArrowRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { QuickActionButton } from '@/components/ui/quick-action-button';
import { StatCard } from '@/components/ui/stat-card';
import { SessionCard } from '@/components/ui/session-card';
import { PendingMentorRequestCard } from '@/components/ui/pending-mentor-request-card';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { ErrorBoundary } from '@/components/ui/error-boundary';

import { usePendingMentorRequests } from '@/hooks/use-pending-mentor-requests';
import { pageTransition, staggerContainer, scaleIn } from '@/lib/animation-variants';
import { reportInfo } from '@/lib/rollbar-utils';

interface HomePageClientProps {
    user: {
        firstName: string;
        fullName?: string;
        avatarUrl?: string; // Add avatarUrl to props even if not used explicitly in rendering (reserved for header if needed)
        id: string; // Add user id to props 
    };
    stats: {
        totalSessions: number;
        activeMentors: number;
        monthSessions: number;
    };
    recentActivity: any[];
}

export const HomePageClient: React.FC<HomePageClientProps> = ({
    user,
    stats,
    recentActivity
}) => {
    const router = useRouter();
    const {
        requests,
        loading: requestsLoading,
        processingId,
        acceptRequest,
        declineRequest
    } = usePendingMentorRequests(user.id);

    const handleFindMentor = () => router.push('/mentors');
    const handleBookSession = () => router.push('/appointments');
    const handleEmergency = () => {
        reportInfo('Emergency button clicked', 'home.emergency');
        router.push('/resources/crisis');
    };

    return (
        <motion.div
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-7xl mx-auto px-6 py-8 space-y-12"
        >
            {/* Greeting Header */}
            <header className="flex justify-between items-start">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">
                        Welcome back
                    </p>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                        Hello, <span className="text-primary">{user.firstName}</span>
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3"
                >
                    <button
                        onClick={handleEmergency}
                        className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors group relative"
                        aria-label="Crisis Support"
                    >
                        <Phone size={22} className="stroke-[2.5px] group-hover:scale-110 transition-transform" />
                        <span className="absolute -bottom-8 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Crisis Support
                        </span>
                    </button>

                    <button
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1a2c32] border border-gray-100 dark:border-border-dark flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm relative group"
                        onClick={() => router.push('/notifications')}
                    >
                        <Bell size={22} className="stroke-[2.5px] group-hover:scale-110 transition-transform" />
                        <NotificationBadge count={requests.length} />
                    </button>
                </motion.div>
            </header>

            {/* Pending Requests Banner */}
            {!requestsLoading && requests.length > 0 && (
                <ErrorBoundary context="home.pending_requests">
                    <motion.div
                        variants={scaleIn}
                        className="bg-orange-50 dark:bg-orange-500/5 rounded-[32px] p-6 border border-orange-100 dark:border-orange-500/10"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-black text-orange-900 dark:text-orange-200">
                                    Pending Requests
                                </h3>
                                <p className="text-orange-700/80 dark:text-orange-300/80 text-sm font-medium">
                                    {requests.length} mentor{requests.length !== 1 ? 's' : ''} waiting for your response
                                </p>
                            </div>
                            {requests.length > 3 && (
                                <Button
                                    variant="link"
                                    className="text-orange-600 dark:text-orange-400 font-bold"
                                    onClick={() => router.push('/mentors/requests')}
                                >
                                    View All
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {requests.slice(0, 3).map((request) => (
                                <PendingMentorRequestCard
                                    key={request.id}
                                    request={{
                                        id: request.id,
                                        created_at: request.created_at || new Date().toISOString(), // Add fallback if missing
                                        mentor: {
                                            id: request.mentors.id,
                                            full_name: request.mentors.profiles.full_name || 'Unknown Mentor',
                                            specialization: request.mentors.profiles.specialization || 'General Mentor',
                                            avatar_url: request.mentors.profiles.avatar_url,
                                            expertise_areas: request.mentors.profiles.expertise_areas || [],
                                            rating: request.mentors.profiles.rating_average || 5.0,
                                        },
                                        notes: request.initial_note || 'Hi, I would like to connect properly.',
                                        status: 'pending',
                                    }}
                                    onAccept={() => acceptRequest(request.id)}
                                    onDecline={() => declineRequest(request.id)}
                                    isProcessing={processingId === request.id}
                                />
                            ))}
                        </div>
                    </motion.div>
                </ErrorBoundary>
            )}

            {/* Quick Actions */}
            <motion.section
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                <motion.div variants={scaleIn}>
                    <QuickActionButton
                        title="Find a Mentor"
                        subtitle="Connect with verified experts"
                        icon={Search}
                        onClick={handleFindMentor}
                        color="#3b82f6"
                        delay={0.1}
                    />
                </motion.div>
                <motion.div variants={scaleIn}>
                    <QuickActionButton
                        title="Book Session"
                        subtitle="Schedule your next meeting"
                        icon={Calendar}
                        onClick={handleBookSession}
                        color="#10b981"
                        delay={0.2}
                    />
                </motion.div>
            </motion.section>

            {/* Stats Overview */}
            <motion.section variants={staggerContainer}>
                <h3 className="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-6 ml-2">
                    Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Sessions"
                        value={stats.totalSessions}
                        icon={Clock}
                        iconColor="#8b5cf6"
                        growth={stats.monthSessions > 0 ? `${stats.monthSessions} new` : undefined}
                    />
                    <StatCard
                        title="Active Mentors"
                        value={stats.activeMentors}
                        icon={Users}
                        iconColor="#ec4899"
                    />
                    <StatCard
                        title="This Month"
                        value={stats.monthSessions}
                        icon={TrendingUp}
                        iconColor="#f59e0b"
                        growthLabel="sessions completed"
                    />
                </div>
            </motion.section>

            {/* Recent Activity */}
            <section className="space-y-6">
                <div className="flex justify-between items-end px-2">
                    <h3 className="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">
                        Upcoming Activity
                    </h3>
                    <Button
                        variant="link"
                        size="sm"
                        onClick={() => router.push('/appointments')}
                        className="text-gray-400 hover:text-primary pt-0 pb-0 h-auto"
                    >
                        View All
                    </Button>
                </div>

                <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                            <SessionCard
                                key={activity.id}
                                title={`${activity.mentors?.profiles?.full_name || 'Session'} session`}
                                date={new Date(activity.start_time).toLocaleDateString()}
                                duration={activity.duration_minutes + ' min'}
                                status={activity.status}
                                menteeName={activity.mentors?.profiles?.full_name || 'Mentor'}
                                menteeAvatar={activity.mentors?.profiles?.avatar_url}
                                meetingLink={activity.meeting_link}
                                onClick={() => router.push(`/appointments/${activity.id}`)}
                            />
                        ))
                    ) : (
                        <div className="bg-gray-50 dark:bg-[#1a2c32] rounded-3xl p-8 text-center border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-400 dark:text-gray-500 font-medium">No upcoming sessions</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={handleFindMentor}
                            >
                                Browse Mentors
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </motion.div>
    );
};
