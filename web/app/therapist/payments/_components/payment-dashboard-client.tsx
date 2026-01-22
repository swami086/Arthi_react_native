'use client';

import React from 'react';
import { useTherapistEarnings } from '../../_hooks/useTherapistEarnings';
import { EarningsCard } from '@/components/ui/earnings-card';
import { PaymentCard } from '@/components/ui/payment-card';
import {
    Wallet,
    TrendingUp,
    Clock,
    DollarSign,
    RefreshCw,
    Download,
    ChevronRight,
    Search
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { exportPaymentHistoryAction } from '../../_actions/paymentActions';
import { format } from 'date-fns';

import { PaymentBreakdown } from './payment-breakdown';

interface PaymentDashboardClientProps {
    user: any;
}

export default function PaymentDashboardClient({ user }: PaymentDashboardClientProps) {
    const { earnings, transactions, breakdown, chartData, loading, refreshing, onRefresh } = useTherapistEarnings();

    const handleExport = async () => {
        if (!user?.id) return;

        toast.promise(exportPaymentHistoryAction(user.id), {
            loading: 'Generating export...',
            success: (data: any) => {
                if (data.success && data.csvData) {
                    const csvContent = (data.csvData as any[][]).map(e => e.join(",")).join("\n");
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `earnings_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    return 'Export downloaded successfully!';
                }
                throw new Error(data.error || 'Failed to export');
            },
            error: (err: any) => `Export failed: ${err.message}`
        });
    };

    const transformedChartData = chartData?.labels.map((label: string, index: number) => ({
        name: label,
        earnings: chartData.data[index]
    })) || [];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                    <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
                    <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-3xl" />)}
                </div>
                <div className="h-96 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Earnings & Payouts
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Track your performance and manage your revenue.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold gap-2"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        className="rounded-xl font-bold gap-2"
                        onClick={onRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <EarningsCard
                    title="Total Revenue"
                    amount={earnings?.total || 0}
                    icon={Wallet}
                    color="#6366f1"
                    trend={earnings?.trend}
                    delay={0}
                />
                <EarningsCard
                    title="Available for Payout"
                    amount={earnings?.available || 0}
                    icon={DollarSign}
                    color="#10b981"
                    delay={0.1}
                />
                <EarningsCard
                    title="Pending Payouts"
                    amount={earnings?.pending || 0}
                    icon={Clock}
                    color="#f59e0b"
                    delay={0.2}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Chart Section */}
                <div className="xl:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#1a2c32] rounded-3xl p-6 border border-gray-100 dark:border-border-dark shadow-sm overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Revenue Growth
                            </h3>
                            <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl">
                                <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-gray-700 shadow-sm text-primary">6 Months</button>
                                <button className="px-3 py-1.5 text-xs font-bold text-gray-500 rounded-lg hover:text-gray-900 dark:hover:text-gray-300">Yearly</button>
                            </div>
                        </div>

                        <div className="h-[350px] w-full min-h-[350px]">
                            {transformedChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={transformedChartData}>
                                    <defs>
                                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-10" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            padding: '12px'
                                        }}
                                        labelStyle={{ fontWeight: 'black', color: '#111827', marginBottom: '4px' }}
                                        itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                                        formatter={(value: any) => [`₹${(value as number).toLocaleString()}`, 'Earnings']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="earnings"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorEarnings)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                    <p className="font-medium">No chart data available</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Recent Transactions Sidebar */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-xl text-gray-900 dark:text-white">Recent Payouts</h3>
                        <Button variant="link" size="sm" className="text-primary font-bold gap-1 group p-0">
                            See All <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search transactions..."
                            className="pl-11 bg-white dark:bg-[#1a2c32] rounded-2xl border-gray-100 dark:border-border-dark"
                        />
                    </div>

                    <div className="space-y-1">
                        <AnimatePresence initial={false}>
                            {transactions.length > 0 ? (
                                transactions.map((transaction: any, index: number) => (
                                    <PaymentCard
                                        key={transaction.id}
                                        payment={transaction as any}
                                        delay={(index % 5) * 0.05}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium font-bold">No recent transactions</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <PaymentBreakdown payments={breakdown} />
        </div>
    );
}

