'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    getPendingMentorRequests,
    acceptMentorRequest,
    declineMentorRequest
} from '@/app/actions/relationships';
import { reportError } from '@/lib/rollbar-utils';
import { toast } from 'sonner';

export function usePendingMentorRequests(menteeId: string) {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const supabase = createClient();

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getPendingMentorRequests(menteeId);
            setRequests(data);
        } catch (error) {
            reportError(error, 'usePendingMentorRequests.fetch');
        } finally {
            setLoading(false);
        }
    }, [menteeId]);

    useEffect(() => {
        fetchRequests();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('pending-requests')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'mentor_mentee_relationships',
                    filter: `mentee_id=eq.${menteeId}`,
                },
                () => {
                    fetchRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [menteeId, fetchRequests, supabase]);

    const handleAccept = async (relationshipId: string) => {
        setProcessingId(relationshipId);
        try {
            const result = await acceptMentorRequest(relationshipId);
            if (result.success) {
                toast.success('Relationship active! You can now book sessions with this mentor.');
                // Optimistic update
                setRequests(prev => prev.filter(r => r.id !== relationshipId));
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            reportError(error, 'usePendingMentorRequests.accept', { relationshipId });
            toast.error('Something went wrong. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDecline = async (relationshipId: string) => {
        setProcessingId(relationshipId);
        try {
            const result = await declineMentorRequest(relationshipId);
            if (result.success) {
                toast.success('Request declined.');
                // Optimistic update
                setRequests(prev => prev.filter(r => r.id !== relationshipId));
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            reportError(error, 'usePendingMentorRequests.decline', { relationshipId });
            toast.error('Something went wrong. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    return {
        requests,
        loading,
        processingId,
        acceptRequest: handleAccept,
        declineRequest: handleDecline,
        refetch: fetchRequests,
    };
}
