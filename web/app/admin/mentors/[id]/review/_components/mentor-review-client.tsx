'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Check,
    X,
    Briefcase,
    GraduationCap,
    FileText,
    Award,
    Linkedin,
    ExternalLink,
    Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MentorInfoCard } from '@/components/admin/mentor-info-card';
import { ApprovalActionModal } from '@/components/admin/approval-action-modal';
import { Profile } from '@/types/admin';
import { useRouter } from 'next/navigation';
import { approveMentorAction, rejectMentorAction } from '../../../../_actions/adminActions';
import { toast } from 'sonner';
import { reportError } from '@/lib/rollbar-utils';

interface MentorReviewClientProps {
    mentor: Profile;
}

export default function MentorReviewClient({ mentor }: MentorReviewClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
    const [isLoading, setIsLoading] = useState(false);

    const handleActionClick = (type: 'approve' | 'reject') => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleConfirmAction = async (details: string) => {
        setIsLoading(true);
        try {
            const res = modalType === 'approve'
                ? await approveMentorAction(mentor.user_id, details)
                : await rejectMentorAction(mentor.user_id, details);

            if (res.success) {
                toast.success(`Mentor ${modalType === 'approve' ? 'approved' : 'rejected'} successfully`);
                setIsModalOpen(false);
                router.push('/admin/pending-approvals');
                router.refresh();
            } else {
                toast.error(res.error || `Failed to ${modalType} mentor`);
            }
        } catch (error) {
            reportError(error, 'MentorReview:confirmAction');
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-32">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl h-12 w-12 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="rounded-2xl h-12 px-6 font-bold border-red-100 text-red-500 hover:bg-red-50 dark:border-red-900/10"
                        onClick={() => handleActionClick('reject')}
                        disabled={mentor.approval_status === 'rejected'}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Reject Application
                    </Button>
                    <Button
                        variant="primary"
                        className="rounded-2xl h-12 px-8 font-black shadow-lg shadow-primary/20"
                        onClick={() => handleActionClick('approve')}
                        disabled={mentor.approval_status === 'approved'}
                    >
                        <Check className="h-4 w-4 mr-2" />
                        Approve Mentor
                    </Button>
                </div>
            </div>

            {/* Profile Overview */}
            <div className="relative">
                <div className="h-48 w-full bg-gradient-to-r from-primary/10 to-indigo-100 dark:from-primary/5 dark:to-gray-900 rounded-[3rem]" />
                <div className="px-12 -mt-24 flex flex-col md:flex-row items-end gap-8">
                    <div className="h-48 w-48 rounded-[3rem] p-2 bg-white dark:bg-gray-950 shadow-xl overflow-hidden shrink-0">
                        <div className="h-full w-full rounded-[2.5rem] bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-6xl text-primary overflow-hidden">
                            {mentor.avatar_url ? (
                                <img src={mentor.avatar_url} alt={mentor.full_name || ''} className="h-full w-full object-cover" />
                            ) : (
                                mentor.full_name?.charAt(0) || 'M'
                            )}
                        </div>
                    </div>
                    <div className="pb-4 flex-1">
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                {mentor.full_name}
                            </h1>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                mentor.approval_status === 'approved' ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                                    mentor.approval_status === 'rejected' ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                                        "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                            )}>
                                {mentor.approval_status || 'Pending'}
                            </span>
                        </div>
                        <p className="text-gray-500 font-bold flex items-center gap-4">
                            <span className="flex items-center gap-1"><Briefcase className="h-4 w-4 text-primary" /> {mentor.specialization}</span>
                            <span className="flex items-center gap-1"><Mail className="h-4 w-4 text-primary" /> {mentor.phone_number || 'N/A'}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Detailed Info Cards */}
            <div className="grid grid-cols-1 gap-8 mt-12">
                <MentorInfoCard
                    title="Professional Profile"
                    icon={Briefcase}
                    fields={[
                        { label: 'Specialization', value: mentor.specialization },
                        { label: 'Years of Experience', value: `${mentor.years_of_experience} years` },
                        { label: 'Hourly Rate', value: mentor.hourly_rate ? `₹${mentor.hourly_rate}` : 'Not set' },
                        { label: 'Rating (External)', value: mentor.rating_average ? `${mentor.rating_average} / 5` : 'No ratings yet' },
                        { label: 'Short Bio', value: mentor.bio, isFullWidth: true },
                        { label: 'Extended Bio/Statement', value: mentor.mentor_bio_extended, isFullWidth: true },
                    ]}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <MentorInfoCard
                        title="Expertise Areas"
                        icon={Award}
                        fields={[
                            {
                                label: 'Skills & Domains',
                                value: mentor.expertise_areas?.join(', ') || 'None listed',
                                isFullWidth: true
                            }
                        ]}
                    />
                    <MentorInfoCard
                        title="Certifications"
                        icon={GraduationCap}
                        fields={[
                            {
                                label: 'Credentials',
                                value: mentor.certifications?.join(', ') || 'No certifications added',
                                isFullWidth: true
                            }
                        ]}
                    />
                </div>

                {/* Verification Documents Placeholder */}
                <div className="bg-white dark:bg-[#1a2c32] rounded-[2.5rem] p-8 border border-gray-100 dark:border-border-dark shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <FileText className="h-5 w-5" />
                        </div>
                        <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tight">Verification Documents</h3>
                    </div>

                    {mentor.verification_documents && mentor.verification_documents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {mentor.verification_documents.map((doc, idx) => (
                                <a
                                    key={idx}
                                    href={doc}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-all font-bold group"
                                >
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Document #{idx + 1}</span>
                                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No documents uploaded for verification</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Modals */}
            <ApprovalActionModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                type={modalType}
                mentorName={mentor.full_name || 'Mentor'}
                onConfirm={handleConfirmAction}
                isLoading={isLoading}
            />
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
