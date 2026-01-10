'use client';

import { useState } from 'react';
import { usePaymentHistory } from '@/hooks/use-payment-history';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    SlidersHorizontal,
    Search,
    Copy,
    CreditCard,
    QrCode,
    RefreshCcw,
    CheckCircle2,
    AlertCircle,
    RotateCcw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';

const FILTER_OPTIONS = ['All', 'Completed', 'Pending', 'Refunded', 'Failed'] as const;
type FilterType = typeof FILTER_OPTIONS[number];

export default function PaymentHistoryClient() {
    const router = useRouter();
    const { payments: history, loading: isLoading, onRefresh: refresh } = usePaymentHistory();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');

    const filteredHistory = history.filter(item => {
        const matchesSearch =
            item.appointment?.mentor?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.razorpay_payment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeFilter === 'All') return matchesSearch;

        const statusMap: Record<FilterType, string> = {
            'All': '',
            'Completed': 'paid',
            'Pending': 'pending',
            'Refunded': 'refunded',
            'Failed': 'failed'
        };

        return matchesSearch && item.status === statusMap[activeFilter];
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('ID copied to clipboard');
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'paid':
                return {
                    bg: 'bg-emerald-100 dark:bg-emerald-500/10',
                    text: 'text-emerald-700 dark:text-emerald-400',
                    dot: 'bg-emerald-500',
                    label: 'Success'
                };
            case 'pending':
                return {
                    bg: 'bg-amber-100 dark:bg-amber-500/10',
                    text: 'text-amber-700 dark:text-amber-400',
                    dot: 'bg-amber-500 animate-pulse',
                    label: 'Pending'
                };
            case 'failed':
                return {
                    bg: 'bg-rose-100 dark:bg-rose-500/10',
                    text: 'text-rose-700 dark:text-rose-400',
                    dot: 'bg-rose-500',
                    label: 'Failed'
                };
            case 'refunded':
                return {
                    bg: 'bg-slate-200 dark:bg-slate-700/50',
                    text: 'text-slate-600 dark:text-slate-400',
                    dot: 'bg-slate-500',
                    label: 'Refunded'
                };
            default:
                return {
                    bg: 'bg-gray-100 dark:bg-gray-800',
                    text: 'text-gray-600 dark:text-gray-400',
                    dot: 'bg-gray-500',
                    label: status
                };
        }
    };

    return (
        <div className="w-full max-w-2xl bg-[#0e181b] min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0e181b]/90 backdrop-blur-md px-4 pt-4 pb-4 border-b border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors text-white"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight text-white">Payment History</h1>
                    <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors text-white">
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative group mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Search className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                        className="block w-full py-3.5 pl-12 pr-4 text-base bg-[#1a2a2e] border-none rounded-full placeholder-gray-500 text-white focus:ring-2 focus:ring-[#30bae8] focus:outline-none shadow-sm"
                        placeholder="Search by doctor or transaction ID..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Chips */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {FILTER_OPTIONS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`flex shrink-0 items-center justify-center h-9 px-5 rounded-full transition-all active:scale-95 ${activeFilter === filter
                                ? 'bg-[#30bae8] text-[#0e181b] font-bold shadow-lg shadow-[#30bae8]/25'
                                : 'bg-[#1a2a2e] text-gray-300 border border-transparent hover:bg-[#25383d]'
                                }`}
                        >
                            <span className="text-sm font-medium">{filter}</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* List */}
            <main className="flex-1 px-4 py-8 space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                        <div className="w-12 h-12 border-4 border-[#30bae8]/20 border-t-[#30bae8] rounded-full animate-spin"></div>
                        <p className="text-gray-400 text-sm font-medium">Loading payments...</p>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                        <div className="w-16 h-16 bg-[#1a2a2e] rounded-full flex items-center justify-center mb-2">
                            <Search className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-white font-bold">No payments found</h3>
                        <p className="text-gray-400 text-sm max-w-[200px]">Try adjusting your search or filters.</p>
                        <button
                            onClick={refresh}
                            className="text-[#30bae8] text-sm font-semibold hover:underline"
                        >
                            Refresh list
                        </button>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredHistory.map((item, index) => {
                            const status = getStatusStyles(item.status);
                            const mentor = item.appointment?.mentor;

                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative overflow-hidden rounded-2xl bg-[#1a2a2e] p-4 shadow-sm active:scale-[0.99] transition-all duration-200 border border-white/5"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4">
                                            <div className="relative w-12 h-12 shrink-0">
                                                <img
                                                    alt={mentor?.full_name || 'Mentor'}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white/5"
                                                    src={mentor?.avatar_url || 'https://via.placeholder.com/150'}
                                                />
                                                {item.status === 'completed' && (
                                                    <div className="absolute -bottom-1 -right-1 flex items-center justify-center bg-[#1a2a2e] rounded-full p-0.5">
                                                        <CheckCircle2 className="w-4 h-4 text-[#30bae8] fill-[#30bae8]/20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h3 className="text-base font-bold text-white leading-tight mb-0.5">
                                                    {mentor?.full_name || 'System Payment'}
                                                </h3>
                                                <p className="text-xs font-medium text-gray-400">
                                                    {format(new Date(item.created_at), 'MMM dd, yyyy • h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className={`text-lg font-bold ${item.status === 'failed' ? 'text-rose-400' : 'text-[#30bae8]'}`}>
                                                ₹{item.amount}
                                            </span>
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider">{status.label}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <span className="text-xs font-medium">ID: #{item.razorpay_payment_id?.substring(0, 10) || item.id.substring(0, 8)}</span>
                                            <button
                                                onClick={() => copyToClipboard(item.razorpay_payment_id || item.id)}
                                                className="hover:text-[#30bae8] transition-colors"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.status === 'failed' ? (
                                                <>
                                                    <span className="text-xs text-rose-400 font-medium">Retry Payment</span>
                                                    <button
                                                        onClick={() => router.push(`/payment/checkout?appointmentId=${item.appointment_id}`)}
                                                        className="flex items-center justify-center w-6 h-6 bg-rose-500/20 rounded-md text-rose-400"
                                                    >
                                                        <RefreshCcw className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xs text-gray-400 font-medium">Razorpay</span>
                                                    <div className="flex items-center justify-center w-6 h-6 bg-white/5 rounded-md text-gray-300">
                                                        <CreditCard className="w-3.5 h-3.5" />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}

                {/* End of list padding */}
                {!isLoading && filteredHistory.length > 0 && (
                    <div className="h-20 flex items-center justify-center opacity-40">
                        <p className="text-xs text-gray-500 font-medium">End of history</p>
                    </div>
                )}
            </main>
        </div>
    );
}
