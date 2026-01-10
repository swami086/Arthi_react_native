'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    Check,
    X,
    ChevronRight,
    ShieldCheck,
    Search,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApprovalActionModal } from '@/components/admin/approval-action-modal';
import { Profile } from '@/types/admin';
import Link from 'next/link';
import { approveMentorAction, rejectMentorAction } from '../../_actions/adminActions';
import { toast } from 'sonner';
import { reportError } from '@/lib/rollbar-utils';
import { useRouter } from 'next/navigation';

interface PendingApprovalsClientProps {
    initialMentors: Profile[];
}

export default function PendingApprovalsClient({ initialMentors }: PendingApprovalsClientProps) {
    const [mentors, setMentors] = useState<Profile[]>(initialMentors);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMentor, setSelectedMentor] = useState<Profile | null>(null);
    const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const router = useRouter();

    const filteredMentors = mentors.filter(m =>
        (m.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleActionClick = (mentor: Profile, type: 'approve' | 'reject') => {
        setSelectedMentor(mentor);
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleConfirmAction = async (details: string) => {
        if (!selectedMentor) return;

        setIsActionLoading(true);
        try {
            const userId = selectedMentor.user_id;
            const res = modalType === 'approve'
                ? await approveMentorAction(userId, details)
                : await rejectMentorAction(userId, details);

            if (res.success) {
                toast.success(`Mentor ${modalType === 'approve' ? 'approved' : 'rejected'} successfully`);
                setMentors(prev => prev.filter(m => m.user_id !== userId));
                setIsModalOpen(false);
            } else {
                toast.error(res.error || `Failed to ${modalType} mentor`);
            }
        } catch (error) {
            reportError(error, 'PendingApprovals:confirmAction');
            toast.error('An unexpected error occurred');
        } finally {
            setIsActionLoading(false);
        }
    };

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
                            Pending <span className="text-primary">Approvals</span>
                        </h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                            Review and Verify Mentor Applications
                        </p>
                    </div>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search applications..."
                        className="pl-11 h-12 rounded-2xl bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 shadow-sm focus:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredMentors.length > 0 ? (
                        filteredMentors.map((mentor, index) => (
                            <motion.div
                                key={mentor.user_id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-[#1a2c32] rounded-[2rem] p-6 border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-md transition-all group lg:flex items-center gap-8"
                            >
                                {/* Mentor Info */}
                                <div className="flex items-center gap-5 flex-1">
                                    <div className="h-16 w-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl overflow-hidden shrink-0">
                                        {mentor.avatar_url ? (
                                            <img src={mentor.avatar_url} alt={mentor.full_name || ''} className="h-full w-full object-cover" />
                                        ) : (
                                            mentor.full_name?.charAt(0) || 'M'
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-black text-xl text-gray-900 dark:text-white truncate">
                                                {mentor.full_name}
                                            </h3>
                                            <span className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                Pending Review
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-primary" />
                                            {mentor.specialization || 'General Mentor'} • {mentor.years_of_experience || 0}y Exp
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 mt-6 lg:mt-0 shrink-0">
                                    <Link href={`/admin/mentors/${mentor.user_id}/review`}>
                                        <Button variant="ghost" className="rounded-2xl h-14 px-6 font-bold text-gray-500 hover:text-primary hover:bg-primary/5">
                                            Full Review
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="rounded-2xl h-14 w-14 border-red-100 text-red-500 hover:bg-red-50 dark:border-red-900/10 dark:hover:bg-red-900/5"
                                        onClick={() => handleActionClick(mentor, 'reject')}
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="rounded-2xl h-14 px-8 font-black shadow-lg shadow-primary/20"
                                        onClick={() => handleActionClick(mentor, 'approve')}
                                    >
                                        <Check className="h-5 w-5 mr-2" />
                                        Approve
                                    </Button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-gray-50 dark:bg-gray-900/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 py-20 flex flex-col items-center text-center"
                        >
                            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                                <Clock className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No Pending Applications</h3>
                            <p className="text-gray-500 font-bold max-w-xs">
                                All mentor applications have been processed. Great job staying on top of the queue!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals */}
            {selectedMentor && (
                <ApprovalActionModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    type={modalType}
                    mentorName={selectedMentor.full_name || 'Mentor'}
                    onConfirm={handleConfirmAction}
                    isLoading={isActionLoading}
                />
            )}
        </div>
    );
}
