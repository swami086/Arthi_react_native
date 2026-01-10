'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    Users,
    GraduationCap,
    Shield,
    ArrowRight,
    Activity,
    CheckCircle,
    XCircle,
    UserPlus
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';

interface AdminDashboardClientProps {
    stats: any;
    recentActions: any[];
    adminName: string;
}

export default function AdminDashboardClient({ stats, recentActions, adminName }: AdminDashboardClientProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-1"
            >
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    Welcome back, <span className="text-primary">{adminName}</span>
                </h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                    System Overview & Quick Management
                </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <Link href="/admin/pending-approvals" className="block">
                    <StatCard
                        title="Pending Approvals"
                        value={stats?.pending_approvals || 0}
                        icon={Clock}
                        iconColor="#f59e0b"
                        className="h-full cursor-pointer hover:border-amber-200 dark:hover:border-amber-900/50 transition-colors"
                    />
                </Link>
                <Link href="/admin/therapists" className="block">
                    <StatCard
                        title="Active Therapists"
                        value={stats?.active_therapists || 0}
                        icon={Users}
                        iconColor="#6366f1"
                        className="h-full cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors"
                    />
                </Link>
                <Link href="/admin/patients" className="block">
                    <StatCard
                        title="Total Patients"
                        value={stats?.total_patients || 0}
                        icon={GraduationCap}
                        iconColor="#10b981"
                        className="h-full cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-colors"
                    />
                </Link>
                <Link href="/admin/admins" className="block">
                    <StatCard
                        title="Admins"
                        value={stats?.total_admins || 0}
                        icon={Shield}
                        iconColor="#ec4899"
                        className="h-full cursor-pointer hover:border-pink-200 dark:hover:border-pink-900/50 transition-colors"
                    />
                </Link>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Recent Activity */}
                <motion.div
                    variants={item}
                    initial="hidden"
                    animate="show"
                    className="xl:col-span-2 space-y-6"
                >
                    <div className="bg-white dark:bg-[#1a2c32] rounded-3xl p-8 border border-gray-100 dark:border-border-dark shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Audit Trail
                            </h3>
                            <Link href="/admin/audit">
                                <Button variant="link" size="sm" className="text-primary font-bold">
                                    View All <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentActions && recentActions.length > 0 ? (
                                recentActions.map((action, idx) => (
                                    <div key={action.id || idx} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 group transition-all hover:bg-primary/5">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                            action.action_type === 'approve_therapist' ? "bg-green-100 text-green-600 dark:bg-green-900/30" :
                                                action.action_type === 'reject_therapist' ? "bg-red-100 text-red-600 dark:bg-red-900/30" :
                                                    "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                                        )}>
                                            {action.action_type === 'approve_therapist' ? <CheckCircle className="h-5 w-5" /> :
                                                action.action_type === 'reject_therapist' ? <XCircle className="h-5 w-5" /> :
                                                    <Shield className="h-5 w-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {action.action_type.replace('_', ' ').toUpperCase()}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Target: <span className="font-bold text-gray-700 dark:text-gray-300">{action.target_user_id || 'N/A'}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase">
                                                {format(new Date(action.created_at), 'MMM d, p')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 font-bold">No recent activity detected.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Quick Actions */}
                <motion.div
                    variants={item}
                    initial="hidden"
                    animate="show"
                    className="space-y-6"
                >
                    <div className="bg-white dark:bg-[#1a2c32] rounded-3xl p-8 border border-gray-100 dark:border-border-dark shadow-sm">
                        <h3 className="font-black text-xl text-gray-900 dark:text-white mb-8">Quick Actions</h3>

                        <div className="space-y-4">
                            <Link href="/admin/pending-approvals" className="block">
                                <Button variant="outline" className="w-full h-16 justify-between px-6 rounded-2xl border-amber-200 bg-amber-50/30 hover:bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10 transition-all font-black text-amber-700 dark:text-amber-400">
                                    Review Applications
                                    <Clock className="h-5 w-5" />
                                </Button>
                            </Link>

                            <Link href="/admin/admins/create" className="block">
                                <Button variant="outline" className="w-full h-16 justify-between px-6 rounded-2xl border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-900/10 transition-all font-black text-indigo-700 dark:text-indigo-400">
                                    Add New Admin
                                    <UserPlus className="h-5 w-5" />
                                </Button>
                            </Link>

                            <Link href="/admin/audit" className="block">
                                <Button variant="outline" className="w-full h-16 justify-between px-6 rounded-2xl border-sky-200 bg-sky-50/30 hover:bg-sky-50 dark:border-sky-900/30 dark:bg-sky-900/10 transition-all font-black text-sky-700 dark:text-sky-400">
                                    View Audit Logs
                                    <Activity className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Pro Tip Card */}
                    <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 overflow-hidden relative">
                        <Shield className="absolute -right-8 -bottom-8 h-32 w-32 text-primary/5 rotate-12" />
                        <h4 className="font-black text-primary text-sm uppercase tracking-widest mb-2">Pro Tip</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-bold leading-relaxed relative z-10">
                            Check pending approvals daily to maintain a high-quality therapist network and fast response times.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// Utility to match existing cn function style
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
