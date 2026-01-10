import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../auth/hooks/useAuth';
import { getPendingRelationshipsForPatient, acceptTherapistRequest, declineTherapistRequest } from '../../../api/relationshipService';

import { supabase } from '../../../api/supabase';

export const usePendingTherapistRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await getPendingRelationshipsForPatient(user.id);
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchRequests();

        if (!user?.id) return;

        const subscription = supabase
            .channel(`pending-requests-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'mentor_mentee_relationships',
                    filter: `mentee_id=eq.${user.id}`,
                },
                () => {
                    fetchRequests();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };

    }, [fetchRequests, user?.id]);

    const handleAccept = async (relationshipId: string) => {
        setProcessingId(relationshipId);
        try {
            await acceptTherapistRequest(relationshipId);
            // Optimistic update is handled by fetchRequests, but we can do it here too for faster feedback
            setRequests(prev => prev.filter(r => r.id !== relationshipId));
            Alert.alert("Success", "You have successfully connected with your new mentor!");
        } catch (error: any) {
            console.error('Error accepting request:', error);
            Alert.alert("Error", "Failed to accept request.");
            fetchRequests(); // Revert on error
        } finally {
            setProcessingId(null);
        }
    };

    const handleDecline = async (relationshipId: string) => {
        setProcessingId(relationshipId);
        try {
            await declineTherapistRequest(relationshipId);
            setRequests(prev => prev.filter(r => r.id !== relationshipId));
            Alert.alert("Declined", "Request has been removed.");
        } catch (error: any) {
            console.error('Error declining request:', error);
            Alert.alert("Error", "Failed to decline request.");
            fetchRequests(); // Revert on error
        } finally {
            setProcessingId(null);
        }
    };

    return {
        requests,
        loading,
        processingId,
        refetch: fetchRequests,
        acceptRequest: handleAccept,
        declineRequest: handleDecline
    };
};
