'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Search,
    ArrowLeft,
    CheckCircle,
    XCircle,
    UserPlus,
    Shield,
    Trash2,
    Filter,
    Clock,
    User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface AuditTrailClientProps {
    initialActions: any[];
}

export default function AuditTrailClient({ initialActions }: AuditTrailClientProps) {
    const [actions] = useState(initialActions);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const router = useRouter();

    const actionTypes = ['All', 'approve_therapist', 'reject_therapist', 'create_admin', 'update_admin_role', 'revoke_admin'];

    const filteredActions = useMemo(() => {
        return actions.filter(action => {
            const adminName = action.admin?.full_name || '';
            const matchesSearch = adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                action.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (action.target_user_id || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = typeFilter === 'All' || action.action_type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [actions, searchTerm, typeFilter]);

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'approve_therapist': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'reject_therapist': return <XCircle className="h-5 w-5 text-red-500" />;
            case 'create_admin': return <UserPlus className="h-5 w-5 text-blue-500" />;
            case 'update_admin_role': return <Shield className="h-5 w-5 text-purple-500" />;
            case 'revoke_admin': return <Trash2 className="h-5 w-5 text-orange-500" />;
            default: return <Activity className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl h-12 w-12 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            Audit <span className="text-primary">Trail</span>
                        </h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                            Complete record of administrative actions
                        </p>
                    </div>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search logs..."
                        className="pl-11 h-12 rounded-2xl bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {actionTypes.map(type => (
                    <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={cn(
                            "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            typeFilter === type
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-white dark:bg-gray-950 text-gray-500 hover:text-primary border border-gray-100 dark:border-gray-800"
                        )}
                    >
                        {type.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredActions.length > 0 ? (
                        filteredActions.map((action, index) => (
                            <motion.div
                                key={action.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="bg-white dark:bg-[#1a2c32] rounded-[2rem] p-6 border border-gray-100 dark:border-border-dark shadow-sm flex items-center gap-6"
                            >
                                <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                    {getActionIcon(action.action_type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-tight">
                                            {action.action_type.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold">•</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            {format(new Date(action.created_at), 'MMM d, yyyy • p')}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400 truncate">
                                        Performed by <span className="text-primary">{action.admin?.full_name || 'System'}</span>
                                        {action.target_user_id && (
                                            <> on target <span className="text-gray-800 dark:text-gray-200">{action.target_user_id}</span></>
                                        )}
                                    </p>
                                    {action.details && Object.keys(action.details).length > 0 && (
                                        <div className="mt-3 text-[10px] font-medium text-gray-400 bg-gray-50 dark:bg-gray-950 p-2 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                                            <code className="block truncate">{JSON.stringify(action.details)}</code>
                                        </div>
                                    )}
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-950 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 text-center">
                            <Activity className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest">No matching activities found</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
