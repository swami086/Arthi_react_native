'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Clock, Star, Plus, MessageSquare, Video, FileText } from 'lucide-react';
import { StatCard } from '../../_components/StatCard';
import { QuickActionButton } from '../../_components/QuickActionButton';
import { useTherapistStats, TherapistStats } from '../../_hooks/useTherapistStats';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import Link from 'next/link';

interface TherapistHomeClientProps {
    initialStats: TherapistStats | null;
    initialAppointments: any[];
    initialConversations: any[];
    user: any;
}

export default function TherapistHomeClient({ initialStats, initialAppointments, initialConversations, user }: TherapistHomeClientProps) {
    const { stats, loading } = useTherapistStats();
    // Use initialStats if stats is loading/null, or merge. 
    // Actually hook fetches on mount, so stats will be null initially then populated.
    // If we pass initialData to hook it would be better.
    // For now we can default to initialStats if stats is null.
    const displayStats = stats || initialStats;

    const [appointments, setAppointments] = useState(initialAppointments);
    // Realtime for appointments could be added here similar to stats

    return (
        <div className="space-y-6">
            {/* Header / Welcome */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'Therapist'}!
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Here's what's happening today.
                    </p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {format(new Date(), 'EEEE, MMMM d, yyyy')}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Patients"
                    value={displayStats?.totalPatients || 0}
                    icon={Users}
                    color="text-blue-600"
                    trend={{ value: displayStats?.patientsTrend || 0, label: "vs last month", direction: (displayStats?.patientsTrend || 0) > 0 ? 'up' : 'neutral' }}
                    delay={0}
                />
                <StatCard
                    title="Active Sessions"
                    value={displayStats?.activeSessions || 0}
                    icon={Calendar}
                    color="text-purple-600"
                    trend={{ value: displayStats?.sessionsTrend || 0, label: "this week", direction: (displayStats?.sessionsTrend || 0) > 0 ? 'up' : 'neutral' }}
                    delay={0.1}
                />
                <StatCard
                    title="Total Hours"
                    value={displayStats?.totalHours || 0}
                    icon={Clock}
                    color="text-orange-600"
                    delay={0.2}
                />
                <StatCard
                    title="Rating"
                    value={displayStats?.rating?.toFixed(1) || "5.0"}
                    icon={Star}
                    color="text-yellow-500"
                    delay={0.3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            <QuickActionButton label="Add Patient" icon={Plus} href="/therapist/patients/discovery" color="blue" />
                            <QuickActionButton label="Schedule" icon={Calendar} href="/therapist/sessions/new" color="purple" />
                            <QuickActionButton label="Message" icon={MessageSquare} href="/therapist/messages" color="green" />
                            <QuickActionButton label="Notes" icon={FileText} href="/therapist/patients" color="orange" />
                        </div>
                    </div>

                    {/* Upcoming Sessions */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h3>
                            <Link href="/therapist/sessions" className="text-sm text-primary hover:underline">View all</Link>
                        </div>

                        {appointments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No upcoming sessions today.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {appointments.map((apt) => (
                                    <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {apt.patient?.full_name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{apt.patient?.full_name || 'Unknown Patient'}</p>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(apt.start_time), 'h:mm a')} • Video Call
                                                </p>
                                            </div>
                                        </div>
                                        <Link href={`/session/${apt.id}`}>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="p-2 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                            >
                                                <Video className="h-4 w-4" />
                                            </motion.button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar / Recent Activity */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {initialConversations.map((msg, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-800 dark:text-gray-200">
                                            <span className="font-medium">{msg.sender?.full_name || 'User'}</span> sent a message.
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{format(new Date(msg.created_at), 'MMM d, h:mm a')}</p>
                                    </div>
                                </div>
                            ))}
                            {initialConversations.length === 0 && (
                                <p className="text-sm text-gray-500">No recent activity.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
