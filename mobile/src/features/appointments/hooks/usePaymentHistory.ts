import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../api/supabase';
import { Payment } from '../../../api/types';

export const usePaymentHistory = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPayments = useCallback(async () => {
        try {
            setError(null);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    appointment:appointments(
                        id,
                        start_time,
                        end_time
                    )
                `)
                .or(`mentee_id.eq.${user.id},mentor_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPayments(data as Payment[]);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPayments();
    };

    const getPaymentById = (id: string) => payments.find(p => p.id === id);

    return {
        payments,
        loading,
        refreshing,
        error,
        onRefresh,
        getPaymentById
    };
};
