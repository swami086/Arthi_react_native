import { useState, useEffect, useCallback } from 'react';
import { getPendingTherapistsAction, approveTherapistAction, rejectTherapistAction } from '../_actions/adminActions';
import { Profile } from '@/types/admin';
import { reportError } from '@/lib/rollbar-utils';
import { toast } from 'sonner';

export function usePendingTherapists() {
    const [therapists, setTherapists] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTherapists = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getPendingTherapistsAction();
            if (res.success && res.data) {
                setTherapists(res.data);
            } else {
                setError(res.error || 'Failed to fetch pending therapists');
            }
        } catch (err: any) {
            setError(err.message);
            reportError(err, 'usePendingTherapists:fetch');
        } finally {
            setLoading(false);
        }
    }, []);

    const approveTherapist = async (therapistId: string, notes?: string) => {
        try {
            // Optimistic update
            setTherapists(prev => prev.filter(m => m.user_id !== therapistId));

            const res = await approveTherapistAction(therapistId, notes);
            if (!res.success) {
                toast.error(res.error || 'Failed to approve therapist');
                fetchTherapists(); // Revert
            } else {
                toast.success('Therapist approved successfully');
            }
        } catch (err: any) {
            reportError(err, 'usePendingTherapists:approve');
            fetchTherapists(); // Revert
        }
    };

    const rejectTherapist = async (therapistId: string, reason: string) => {
        try {
            // Optimistic update
            setTherapists(prev => prev.filter(m => m.user_id !== therapistId));

            const res = await rejectTherapistAction(therapistId, reason);
            if (!res.success) {
                toast.error(res.error || 'Failed to reject therapist');
                fetchTherapists(); // Revert
            } else {
                toast.success('Therapist rejected successfully');
            }
        } catch (err: any) {
            reportError(err, 'usePendingTherapists:reject');
            fetchTherapists(); // Revert
        }
    };

    useEffect(() => {
        fetchTherapists();
    }, [fetchTherapists]);

    return { therapists, loading, error, refetch: fetchTherapists, approveTherapist, rejectTherapist };
}
