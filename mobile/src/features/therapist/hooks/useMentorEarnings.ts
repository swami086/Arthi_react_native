import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../api/supabase';
import { Payment } from '../../../api/types';
import { startOfMonth, subMonths, format } from 'date-fns';

export const useTherapistEarnings = () => {
    const [earnings, setEarnings] = useState({
        total: 0,
        thisMonth: 0,
        lastMonth: 0,
        pending: 0,
        available: 0
    });
    const [transactions, setTransactions] = useState<Payment[]>([]);
    const [chartData, setChartData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch payments
            const { data: paymentsData, error } = await supabase
                .from('payments')
                .select('*')
                .eq('mentor_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const payments = paymentsData as Payment[];
            setTransactions(payments);

            // Calculate earnings
            const now = new Date();
            const startOfCurrentMonth = startOfMonth(now);
            const startOfLastMonth = startOfMonth(subMonths(now, 1));

            let total = 0;
            let thisMonth = 0;
            let lastMonth = 0;
            let pending = 0;

            const monthlyData: Record<string, number> = {};
            // Init last 6 months
            for (let i = 5; i >= 0; i--) {
                const d = subMonths(now, i);
                monthlyData[format(d, 'MMM')] = 0;
            }

            payments.forEach(p => {
                const amount = p.mentor_payout || (p.amount * 0.9); // Fallback to 90% if payout not set
                const date = new Date(p.created_at);
                const monthKey = format(date, 'MMM');

                if (p.status === 'completed') {
                    total += amount;
                    if (date >= startOfCurrentMonth) thisMonth += amount;
                    else if (date >= startOfLastMonth && date < startOfCurrentMonth) lastMonth += amount;

                    if (monthlyData[monthKey] !== undefined) {
                        monthlyData[monthKey] += amount;
                    }
                } else if (p.status === 'pending' || p.status === 'processing') {
                    pending += amount;
                }
            });

            setEarnings({
                total,
                thisMonth,
                lastMonth,
                pending,
                available: total // Simplified logic
            });

            setChartData({
                labels: Object.keys(monthlyData),
                data: Object.values(monthlyData)
            });

        } catch (err) {
            console.error('Error fetching mentor earnings:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    return {
        earnings,
        transactions,
        chartData,
        loading,
        refreshing,
        onRefresh
    };
};
