import { useState, useEffect } from 'react';
import { getPendingTherapists, approveTherapist, rejectTherapist } from '../../../api/adminService';
import { Profile } from '../../../api/types';

export const usePendingTherapists = (adminId?: string) => {
    const [pendingTherapists, setPendingTherapists] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchPending = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPendingTherapists();
            setPendingTherapists(data);
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
            await approveTherapist(mentorId, adminId, notes);
            setPendingTherapists(prev => prev.filter(p => p.user_id !== mentorId));
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
            await rejectTherapist(mentorId, adminId, reason);
            setPendingTherapists(prev => prev.filter(p => p.user_id !== mentorId));
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to reject mentor');
        } finally {
            setActionLoading(null);
        }
    };

    return {
        pendingTherapists,
        loading,
        actionLoading,
        error,
        fetchPending,
        handleApprove,
        handleReject
    };
};
