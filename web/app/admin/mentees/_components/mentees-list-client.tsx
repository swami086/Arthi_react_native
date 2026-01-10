'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ArrowLeft,
    GraduationCap,
    Calendar,
    MessageCircle,
    MoreVertical,
    User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Profile } from '@/types/admin';
import { useRouter } from 'next/navigation';

interface MenteesListClientProps {
    initialMentees: Profile[];
}

export default function MenteesListClient({ initialMentees }: MenteesListClientProps) {
    const [mentees] = useState<Profile[]>(initialMentees);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const filteredMentees = useMemo(() => {
        return mentees.filter(m =>
            (m.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [mentees, searchTerm]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl h-12 w-12 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            All <span className="text-primary">Mentees</span>
                        </h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                            Total of {mentees.length} Users Enrolled
                        </p>
                    </div>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search mentees by name..."
                        className="pl-11 h-12 rounded-2xl bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Table/Grid */}
            <div className="bg-white dark:bg-[#1a2c32] rounded-[2.5rem] border border-gray-100 dark:border-border-dark shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b dark:border-gray-800">
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">User Details</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Member Since</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Activity</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            <AnimatePresence mode="popLayout">
                                {filteredMentees.length > 0 ? (
                                    filteredMentees.map((mentee, index) => (
                                        <motion.tr
                                            key={mentee.user_id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-gray-400 shrink-0 overflow-hidden">
                                                        {mentee.avatar_url ? (
                                                            <img src={mentee.avatar_url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <User className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">{mentee.full_name}</p>
                                                        <p className="text-xs font-bold text-gray-400">Mentee Account</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                        {new Date(mentee.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Joined Safespace</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-gray-900 dark:text-white">{mentee.total_sessions || 0}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Sessions</span>
                                                    </div>
                                                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-800" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-gray-900 dark:text-white">Active</span>
                                                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Status</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all">
                                                        <MessageCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                                                        <MoreVertical className="h-4 w-4 text-gray-400" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center">
                                            <p className="text-gray-400 font-bold uppercase tracking-widest">No mentees found matching your search</p>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="px-8 py-6 border-t dark:border-gray-800 flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-500">Showing {filteredMentees.length} of {mentees.length} users</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 font-bold disabled:opacity-30" disabled>Previous</Button>
                        <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 font-bold disabled:opacity-30" disabled>Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
