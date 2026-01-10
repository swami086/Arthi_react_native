'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    UserPlus,
    ArrowLeft,
    MoreVertical,
    Mail,
    ShieldAlert,
    Trash2,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Profile } from '@/types/admin';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { revokeAdminAction, updateAdminRoleAction } from '../../_actions/adminActions';
import { toast } from 'sonner';
import { reportError } from '@/lib/rollbar-utils';

interface AdminsListClientProps {
    initialAdmins: Profile[];
    isSuperAdmin: boolean;
    currentUserId: string;
}

export default function AdminsListClient({ initialAdmins, isSuperAdmin, currentUserId }: AdminsListClientProps) {
    const [admins, setAdmins] = useState<Profile[]>(initialAdmins);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const router = useRouter();

    const handleRevoke = async (adminId: string) => {
        if (!confirm('Are you sure you want to revoke admin access for this user? They will be downgraded to a regular user.')) return;

        setProcessingId(adminId);
        // Optimistic update
        const previousAdmins = [...admins];
        setAdmins(prev => prev.filter(a => a.user_id !== adminId));

        try {
            const res = await revokeAdminAction(adminId);
            if (res.success) {
                toast.success('Admin access revoked');
                router.refresh();
            } else {
                setAdmins(previousAdmins);
                toast.error(res.error || 'Failed to revoke access');
            }
        } catch (error) {
            setAdmins(previousAdmins);
            reportError(error, 'AdminsList:revoke');
            toast.error('An unexpected error occurred');
        } finally {
            setProcessingId(null);
        }
    };

    const handleUpgrade = async (adminId: string) => {
        if (!confirm('Promote this admin to Super Admin? This will give them full control over the admin team.')) return;

        setProcessingId(adminId);
        // Optimistic update
        const previousAdmins = [...admins];
        setAdmins(prev => prev.map(a => a.user_id === adminId ? { ...a, is_super_admin: true } : a));

        try {
            const res = await updateAdminRoleAction(adminId, true);
            if (res.success) {
                toast.success('Admin promoted to Super Admin');
                router.refresh();
            } else {
                setAdmins(previousAdmins);
                toast.error(res.error || 'Failed to upgrade role');
            }
        } catch (error) {
            setAdmins(previousAdmins);
            reportError(error, 'AdminsList:upgrade');
            toast.error('An unexpected error occurred');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl h-12 w-12 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            Admin <span className="text-primary">Team</span>
                        </h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                            {admins.length} Total Platform Administrators
                        </p>
                    </div>
                </div>

                {isSuperAdmin && (
                    <Link href="/admin/admins/create">
                        <Button variant="primary" className="rounded-2xl h-14 px-8 font-black shadow-lg shadow-primary/20 gap-2">
                            <UserPlus className="h-5 w-5" />
                            Add New Admin
                        </Button>
                    </Link>
                )}
            </div>

            {/* Admin Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((admin, index) => (
                    <motion.div
                        key={admin.user_id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-[#1a2c32] rounded-[2.5rem] p-8 border border-gray-100 dark:border-border-dark shadow-sm group hover:shadow-xl transition-all relative overflow-hidden"
                    >
                        {admin.is_super_admin && (
                            <div className="absolute -right-12 -top-12 h-32 w-32 bg-primary/5 rounded-full flex items-center justify-center pt-8 pr-8">
                                <Shield className="h-10 w-10 text-primary/20" />
                            </div>
                        )}

                        <div className="flex flex-col items-center text-center">
                            <div className="h-20 w-20 rounded-[2rem] bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-4xl text-primary mb-6 ring-4 ring-primary/5 ring-offset-4 ring-offset-white dark:ring-offset-[#1a2c32]">
                                {admin.full_name?.charAt(0) || 'A'}
                            </div>

                            <h3 className="font-black text-xl text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                                {admin.full_name}
                                {admin.user_id === currentUserId && <span className="ml-2 text-[10px] text-primary">(You)</span>}
                            </h3>

                            <div className="flex items-center gap-2 mb-6">
                                {admin.is_super_admin ? (
                                    <span className="flex items-center gap-1.5 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                        <ShieldCheck className="h-3 w-3" />
                                        Super Admin
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                        System Admin
                                    </span>
                                )}
                            </div>

                            <div className="w-full space-y-4 pt-6 border-t dark:border-gray-800/50">
                                <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate max-w-[150px]">{admin.phone_number || 'Limited Access'}</span>
                                </div>

                                {isSuperAdmin && admin.user_id !== currentUserId && !admin.is_super_admin && (
                                    <div className="flex gap-2 justify-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-xl h-10 px-4 font-bold text-gray-400 hover:text-red-500 transition-colors"
                                            onClick={() => handleRevoke(admin.user_id!)}
                                            disabled={processingId === admin.user_id}
                                        >
                                            {processingId === admin.user_id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Revoke
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                                            onClick={() => handleUpgrade(admin.user_id!)}
                                            title="Promote to Super Admin"
                                            disabled={processingId === admin.user_id}
                                        >
                                            <ShieldAlert className="h-4 w-4 text-gray-400" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Security Notice */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 p-8 rounded-[2.5rem] bg-indigo-50/50 dark:bg-indigo-900/5 border border-indigo-100 dark:border-indigo-900/10 flex flex-col md:flex-row items-center gap-6"
            >
                <div className="h-14 w-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <ShieldAlert className="h-8 w-8" />
                </div>
                <div>
                    <h4 className="font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-tight">Security Protocol</h4>
                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400/80 leading-relaxed">
                        Only Super Admins can add or remove other administrators. All administrator actions are logged and permanently stored in the system audit trail for security purposes.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

