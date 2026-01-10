import { useState, useEffect } from 'react';
import { getPendingMentors, approveMentor, rejectMentor } from '../../../api/adminService';
import { Profile } from '../../../api/types';

export const usePendingMentors = (adminId?: string) => {
    const [pendingMentors, setPendingMentors] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchPending = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPendingMentors();
            setPendingMentors(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch pending mentors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (mentorId: string, notes?: string) => {
        if (!adminId) return;
        setActionLoading(mentorId);
        setError(null);
        try {
            await approveMentor(mentorId, adminId, notes);
            setPendingMentors(prev => prev.filter(p => p.user_id !== mentorId));
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to approve mentor');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (mentorId: string, reason: string) => {
        if (!adminId) return;
        setActionLoading(mentorId);
        setError(null);
        try {
            await rejectMentor(mentorId, adminId, reason);
            setPendingMentors(prev => prev.filter(p => p.user_id !== mentorId));
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to reject mentor');
        } finally {
            setActionLoading(null);
        }
    };

    return {
        pendingMentors,
        loading,
        actionLoading,
        error,
        fetchPending,
        handleApprove,
        handleReject
    };
};
