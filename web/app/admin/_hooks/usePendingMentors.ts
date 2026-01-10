import { useState, useEffect, useCallback } from 'react';
import { getPendingMentorsAction, approveMentorAction, rejectMentorAction } from '../_actions/adminActions';
import { Profile } from '@/types/admin';
import { reportError } from '@/lib/rollbar-utils';
import { toast } from 'sonner';

export function usePendingMentors() {
    const [mentors, setMentors] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMentors = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getPendingMentorsAction();
            if (res.success && res.data) {
                setMentors(res.data);
            } else {
                setError(res.error || 'Failed to fetch pending mentors');
            }
        } catch (err: any) {
            setError(err.message);
            reportError(err, 'usePendingMentors:fetch');
        } finally {
            setLoading(false);
        }
    }, []);

    const approveMentor = async (mentorId: string, notes?: string) => {
        try {
            // Optimistic update
            setMentors(prev => prev.filter(m => m.user_id !== mentorId));

            const res = await approveMentorAction(mentorId, notes);
            if (!res.success) {
                toast.error(res.error || 'Failed to approve mentor');
                fetchMentors(); // Revert
            } else {
                toast.success('Mentor approved successfully');
            }
        } catch (err: any) {
            reportError(err, 'usePendingMentors:approve');
            fetchMentors(); // Revert
        }
    };

    const rejectMentor = async (mentorId: string, reason: string) => {
        try {
            // Optimistic update
            setMentors(prev => prev.filter(m => m.user_id !== mentorId));

            const res = await rejectMentorAction(mentorId, reason);
            if (!res.success) {
                toast.error(res.error || 'Failed to reject mentor');
                fetchMentors(); // Revert
            } else {
                toast.success('Mentor rejected successfully');
            }
        } catch (err: any) {
            reportError(err, 'usePendingMentors:reject');
            fetchMentors(); // Revert
        }
    };

    useEffect(() => {
        fetchMentors();
    }, [fetchMentors]);

    return { mentors, loading, error, refetch: fetchMentors, approveMentor, rejectMentor };
}
