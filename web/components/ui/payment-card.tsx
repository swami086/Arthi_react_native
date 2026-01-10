'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { Payment } from '@/types/database';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { reportError, reportWarning } from '@/lib/rollbar-utils';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PaymentCardProps {
    payment: Payment;
    onClick?: () => void;
    className?: string;
    delay?: number;
}

const statusConfig: Record<string, any> = {
    completed: {
        color: '#10b981',
        icon: CheckCircle,
        label: 'Success',
    },
    failed: {
        color: '#ef4444',
        icon: AlertCircle,
        label: 'Failed',
    },
    pending: {
        color: '#f59e0b',
        icon: Clock,
        label: 'Pending',
    },
    processing: {
        color: '#3b82f6',
        icon: Clock,
        label: 'Processing',
    },
    refunded: {
        color: '#6b7280',
        icon: AlertCircle,
        label: 'Refunded',
    },
};

export const PaymentCard: React.FC<PaymentCardProps> = ({
    payment,
    onClick,
    className,
    delay = 0,
}) => {
    const isUnknownStatus = !statusConfig[payment.status];

    React.useEffect(() => {
        if (isUnknownStatus) {
            reportWarning(`Unknown payment status detected: ${payment.status}`, 'payment_card.status', { paymentId: payment.id });
        }
    }, [isUnknownStatus, payment.status, payment.id]);

    const config = statusConfig[payment.status] || statusConfig.pending;
    const statusColor = config.color;
    const StatusIcon = config.icon;

    const handleClick = () => {
        if (!onClick) return;
        try {
            onClick();
        } catch (error) {
            reportError(error, 'payment_card.click', { paymentId: payment.id });
            throw error;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={onClick ? { scale: 1.01 } : {}}
            className={cn(
                'group bg-white dark:bg-[#1a2c32] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-border-dark mb-4 transition-all duration-200',
                onClick && 'cursor-pointer hover:shadow-md hover:border-primary/20',
                className
            )}
            onClick={handleClick}
        >
            <div className="flex justify-between items-start mb-4 gap-4">
                <div>
                    <h3 className="text-gray-900 dark:text-gray-100 font-black text-xl tracking-tight leading-none mb-1.5 tabular-nums">
                        {payment.currency} {payment.amount}
                    </h3>
                    <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold tabular-nums uppercase tracking-wide">
                        {format(new Date(payment.created_at), 'PPP')}
                    </p>
                </div>

                <div
                    className="px-3 py-1.5 rounded-full flex items-center gap-1.5 border"
                    style={{
                        backgroundColor: `${statusColor}10`,
                        borderColor: `${statusColor}20`,
                        color: statusColor
                    }}
                >
                    <StatusIcon size={12} className="stroke-[3px]" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                        {payment.status}
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-border-dark">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <CreditCard size={14} className="opacity-60" />
                    <span className="text-xs font-bold leading-none">
                        {payment.payment_method || 'Unknown Method'}
                    </span>
                </div>

                {payment.razorpay_payment_id && (
                    <div className="px-2 py-1 rounded bg-gray-50 dark:bg-gray-800/50">
                        <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 opacity-80 leading-none">
                            ID: ...{payment.razorpay_payment_id.slice(-8)}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
