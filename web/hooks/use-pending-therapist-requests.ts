'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    getPendingTherapistRequests,
    acceptTherapistRequest,
    declineTherapistRequest
} from '@/app/actions/relationships';
import { reportError } from '@/lib/rollbar-utils';
import { toast } from 'sonner';

export function usePendingTherapistRequests(patientId: string) {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const supabase = createClient();

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getPendingTherapistRequests(patientId);
            setRequests(data);
        } catch (error) {
            reportError(error, 'usePendingTherapistRequests.fetch');
        } finally {
            setLoading(false);
        }
    }, [patientId]);

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
                    table: 'therapist_patient_relationships',
                    filter: `patient_id=eq.${patientId}`,
                },
                () => {
                    fetchRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [patientId, fetchRequests, supabase]);

    const handleAccept = async (relationshipId: string) => {
        setProcessingId(relationshipId);
        try {
            const result = await acceptTherapistRequest(relationshipId);
            if (result.success) {
                toast.success('Relationship active! You can now book sessions with this therapist.');
                // Optimistic update
                setRequests(prev => prev.filter(r => r.id !== relationshipId));
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            reportError(error, 'usePendingTherapistRequests.accept', { relationshipId });
            toast.error('Something went wrong. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDecline = async (relationshipId: string) => {
        setProcessingId(relationshipId);
        try {
            const result = await declineTherapistRequest(relationshipId);
            if (result.success) {
                toast.success('Request declined.');
                // Optimistic update
                setRequests(prev => prev.filter(r => r.id !== relationshipId));
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            reportError(error, 'usePendingTherapistRequests.decline', { relationshipId });
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
