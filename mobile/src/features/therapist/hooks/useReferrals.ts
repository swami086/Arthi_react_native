import { useState, useEffect } from 'react';
import { getReferralsReceived, getReferralsSent, respondToReferral } from '../../../api/mentorService';

export const useReferrals = (mentorId?: string) => {
    const [received, setReceived] = useState<any[]>([]);
    const [sent, setSent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReferrals = async () => {
        if (!mentorId) return;
        setLoading(true);
        setError(null);
        try {
            const [rData, sData] = await Promise.all([
                getReferralsReceived(mentorId),
                getReferralsSent(mentorId)
            ]);
            setReceived(rData);
            setSent(sData);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch referrals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferrals();
    }, [mentorId]);

    const handleResponse = async (referralId: string, status: 'accepted' | 'declined', notes?: string) => {
        setError(null);
        try {
            await respondToReferral(referralId, status, notes);
            await fetchReferrals(); // Refresh to update status
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to respond to referral');
            throw err;
        }
    };

    return { received, sent, loading, error, fetchReferrals, handleResponse };
};
