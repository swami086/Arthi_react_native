'use client';

import { useState, useEffect, useCallback } from 'react';
import { PaymentWithAppointment } from '@/types/payment';

export function usePaymentHistory() {
    const [payments, setPayments] = useState<PaymentWithAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await fetch('/api/payment/history');
            const result = await response.json();

            if (response.ok && result.success && result.data) {
                setPayments(result.data);
            } else {
                setError(result.error || 'Failed to fetch history');
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const filterPayments = (status: string | 'All') => {
        if (status === 'All') return payments;
        return payments.filter(p => p.status === status.toLowerCase());
    };

    return {
        payments,
        loading,
        refreshing,
        error,
        onRefresh: () => fetchHistory(true),
        filterPayments
    };
}
