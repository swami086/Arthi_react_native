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
            setError(err.message || 'Failed to fetch pending therapists');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (therapistId: string, notes?: string) => {
        if (!adminId) return;
        setActionLoading(therapistId);
        setError(null);
        try {
            await approveTherapist(therapistId, adminId, notes);
            setPendingTherapists(prev => prev.filter(p => p.user_id !== therapistId));
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to approve therapist');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (therapistId: string, reason: string) => {
        if (!adminId) return;
        setActionLoading(therapistId);
        setError(null);
        try {
            await rejectTherapist(therapistId, adminId, reason);
            setPendingTherapists(prev => prev.filter(p => p.user_id !== therapistId));
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to reject therapist');
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
