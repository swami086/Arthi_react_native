'use client';

import { useState, useEffect, useCallback } from 'react';
import { MentorEarnings, PaymentWithMentee, EarningsChartData } from '@/types/payment';
import { reportError, startTimer, endTimer } from '@/lib/rollbar-utils';
import { startOfMonth, subMonths, format, eachMonthOfInterval, addMonths } from 'date-fns';
import { getMentorEarningsAction, getMentorTransactionsAction, getMentorPaymentBreakdownAction } from '@/app/actions/payment';

export function useMentorEarnings() {
    const [earnings, setEarnings] = useState<MentorEarnings | null>(null);
    const [transactions, setTransactions] = useState<PaymentWithMentee[]>([]);
    const [breakdown, setBreakdown] = useState<PaymentWithMentee[]>([]);
    const [chartData, setChartData] = useState<EarningsChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    // Removed direct supabase client usage for data fetching

    const fetchEarningsData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const timerName = 'useMentorEarnings_fetch';
        startTimer(timerName);

        try {
            // 1. Fetch Summary using server action
            const summary = await getMentorEarningsAction();
            setEarnings(summary);

            // 2. Fetch Transactions using server action
            const txs = await getMentorTransactionsAction(10);
            setTransactions(txs);

            // 3. Fetch Breakdown using server action
            const breakdownData = await getMentorPaymentBreakdownAction();
            setBreakdown(breakdownData);

            // 4. Generate Chart Data based on breakdown data (full history)
            const now = new Date();
            const sixMonthsAgo = startOfMonth(subMonths(now, 5));
            const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });

            const labels = months.map(m => format(m, 'MMM'));
            const dataValues = months.map(m => {
                const mStart = startOfMonth(m);
                const mEnd = startOfMonth(addMonths(m, 1));
                return breakdownData
                    .filter(p => p.status === 'completed' && new Date(p.created_at) >= mStart && new Date(p.created_at) < mEnd)
                    .reduce((sum, p) => sum + (p.mentor_payout || p.amount * 0.9), 0);
            });

            setChartData({ labels, data: dataValues });

            endTimer(timerName, 'useMentorEarnings.success');
        } catch (error) {
            reportError(error as any, 'useMentorEarnings:fetchEarningsData');
            endTimer(timerName, 'useMentorEarnings.error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchEarningsData();
    }, [fetchEarningsData]);

    const onRefresh = () => fetchEarningsData(true);

    return {
        earnings,
        transactions,
        breakdown,
        chartData,
        loading,
        refreshing,
        onRefresh
    };
}
