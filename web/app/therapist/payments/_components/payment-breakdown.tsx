'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PaymentWithPatient } from '@/types/payment';
import {
    Users,
    Calendar,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';

interface PaymentBreakdownProps {
    payments: PaymentWithPatient[];
}

export function PaymentBreakdown({ payments }: PaymentBreakdownProps) {
    const patientStats = useMemo(() => {
        const stats: Record<string, {
            name: string;
            total: number;
            count: number;
            avatar?: string | null
        }> = {};

        payments.filter(p => p.status === 'completed').forEach(p => {
            const patientId = p.patient_id;
            if (!stats[patientId]) {
                stats[patientId] = {
                    name: p.patient?.full_name || 'Unknown',
                    total: 0,
                    count: 0,
                    avatar: p.patient?.avatar_url
                };
            }
            stats[patientId].total += p.therapist_payout || p.amount * 0.9;
            stats[patientId].count += 1;
        });

        return Object.values(stats).sort((a, b) => b.total - a.total);
    }, [payments]);

    const sessionStats = useMemo(() => {
        return payments.slice(0, 10).map(p => ({
            id: p.id,
            patientName: p.patient?.full_name || 'Unknown',
            startTime: p.appointment?.start_time || p.created_at,
            amount: p.therapist_payout || p.amount * 0.9,
            status: p.status
        }));
    }, [payments]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            {/* Patient Breakdown */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-[#1a2c32] rounded-3xl p-6 border border-gray-100 dark:border-border-dark shadow-sm"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Earnings by Patient
                    </h3>
                </div>

                <div className="space-y-4">
                    {patientStats.length > 0 ? (
                        patientStats.slice(0, 5).map((stat, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 group transition-all hover:bg-primary/5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                                        {stat.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{stat.name}</p>
                                        <p className="text-xs text-gray-500">{stat.count} Sessions</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-900 dark:text-white tabular-nums">₹{stat.total.toLocaleString()}</p>
                                    <p className="text-[10px] uppercase font-bold text-green-500 flex items-center justify-end gap-1">
                                        <ArrowUpRight className="h-3 w-3" />
                                        Performance
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-400 font-medium">No patient data available</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Session Breakdown */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-[#1a2c32] rounded-3xl p-6 border border-gray-100 dark:border-border-dark shadow-sm"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Earnings by Session
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-50 dark:border-border-dark">
                                <th className="pb-4 text-[10px] uppercase font-black tracking-widest text-gray-400">Date</th>
                                <th className="pb-4 text-[10px] uppercase font-black tracking-widest text-gray-400">Patient</th>
                                <th className="pb-4 text-right text-[10px] uppercase font-black tracking-widest text-gray-400">Payout</th>
                                <th className="pb-4 text-right text-[10px] uppercase font-black tracking-widest text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-border-dark">
                            {sessionStats.length > 0 ? (
                                sessionStats.map((session, idx) => (
                                    <tr key={idx} className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                                        <td className="py-4 font-bold text-xs text-gray-500">
                                            {format(new Date(session.startTime), 'MMM d, p')}
                                        </td>
                                        <td className="py-4 font-bold text-sm text-gray-900 dark:text-white">
                                            {session.patientName}
                                        </td>
                                        <td className="py-4 text-right font-black tabular-nums text-gray-900 dark:text-white">
                                            ₹{session.amount.toLocaleString()}
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${session.status === 'completed'
                                                    ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                                    : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                                                }`}>
                                                {session.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-400 font-medium font-bold">No sessions found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
