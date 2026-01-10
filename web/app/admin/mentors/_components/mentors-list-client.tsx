'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    ArrowLeft,
    ChevronRight,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    MoreVertical,
    FileEdit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Profile } from '@/types/admin';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TherapistsListClientProps {
    initialTherapists: Profile[];
}

export default function TherapistsListClient({ initialTherapists }: TherapistsListClientProps) {
    const [therapists] = useState<Profile[]>(initialTherapists);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const router = useRouter();

    const filters = ['All', 'Pending', 'Approved', 'Rejected'];

    const filteredTherapists = useMemo(() => {
        return therapists.filter(m => {
            const matchesSearch = (m.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (m.specialization || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' ||
                m.approval_status?.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [therapists, searchTerm, statusFilter]);

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
                            All <span className="text-primary">Therapists</span>
                        </h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                            Manage {therapists.length} Verified and Applicant Therapists
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search therapists..."
                            className="pl-11 h-12 rounded-2xl bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Add New Therapist could go here */}
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={cn(
                            "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                            statusFilter === filter
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-white dark:bg-gray-950 text-gray-500 hover:text-primary border border-gray-100 dark:border-gray-800 hover:border-primary/20"
                        )}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredTherapists.length > 0 ? (
                        filteredTherapists.map((therapist, index) => (
                            <motion.div
                                key={therapist.user_id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.03 }}
                                className="bg-white dark:bg-[#1a2c32] rounded-[2.5rem] p-6 border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
                            >
                                {/* Status Icon Background Decor */}
                                {therapist.approval_status === 'approved' ? (
                                    <CheckCircle2 className="absolute -right-4 -bottom-4 h-24 w-24 text-green-500/5 group-hover:text-green-500/10 transition-colors" />
                                ) : therapist.approval_status === 'rejected' ? (
                                    <XCircle className="absolute -right-4 -bottom-4 h-24 w-24 text-red-500/5 group-hover:text-red-500/10 transition-colors" />
                                ) : (
                                    <Clock className="absolute -right-4 -bottom-4 h-24 w-24 text-amber-500/5 group-hover:text-amber-500/10 transition-colors" />
                                )}

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 text-primary flex items-center justify-center font-black text-2xl shrink-0 overflow-hidden">
                                        {therapist.avatar_url ? (
                                            <img src={therapist.avatar_url} alt={therapist.full_name || ''} className="h-full w-full object-cover" />
                                        ) : (
                                            therapist.full_name?.charAt(0) || 'M'
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="font-black text-lg text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                                            {therapist.full_name}
                                        </h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
                                            {therapist.specialization || 'General Therapist'}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                        therapist.approval_status === 'approved' ? "bg-green-100 text-green-600" :
                                            therapist.approval_status === 'rejected' ? "bg-red-100 text-red-600" :
                                                "bg-amber-100 text-amber-600"
                                    )}>
                                        {therapist.approval_status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> :
                                            therapist.approval_status === 'rejected' ? <XCircle className="h-4 w-4" /> :
                                                <Clock className="h-4 w-4" />}
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center justify-between text-xs font-bold px-1 text-gray-500">
                                        <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> 12 Patients</span>
                                        <span>{therapist.years_of_experience || 0} Years Exp</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/admin/therapists/${therapist.user_id}/review`} className="flex-1">
                                            <Button variant="outline" className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest border-gray-100 dark:border-gray-800 hover:bg-primary hover:text-white transition-all">
                                                <FileEdit className="h-3.5 w-3.5 mr-2" />
                                                View Profile
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-gray-400 font-bold uppercase tracking-widest">No therapists found matching your criteria</p>
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
