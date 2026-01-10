'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { reportError, reportWarning, reportInfo } from '@/lib/rollbar-utils';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ErrorBannerProps {
    message: string;
    onRetry?: () => void;
    visible: boolean;
    onClose?: () => void;
    className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
    message,
    onRetry,
    visible,
    onClose,
    className
}) => {
    React.useEffect(() => {
        if (visible) {
            reportWarning(`Error displayed in banner: ${message}`, 'error_banner.visible');
        }
    }, [visible, message]);

    const handleRetry = () => {
        reportInfo('Error banner retry clicked', 'error_banner.retry', { message });
        onRetry?.();
    };

    const handleClose = () => {
        reportInfo('Error banner close clicked', 'error_banner.close', { message });
        onClose?.();
    };
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                        'bg-red-50 dark:bg-red-500/10 p-5 rounded-3xl border border-red-100 dark:border-red-500/20 flex items-start gap-4 mb-6 shadow-xl shadow-red-500/5',
                        className
                    )}
                >
                    <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0 text-red-600">
                        <AlertCircle size={22} className="stroke-[2.5px]" />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                        <h4 className="text-red-900 dark:text-red-400 font-black text-sm uppercase tracking-widest leading-none mb-2">
                            Error Detected
                        </h4>
                        <p className="text-red-700 dark:text-red-300 text-sm font-semibold leading-relaxed">
                            {message}
                        </p>

                        {onRetry && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRetry}
                                className="mt-4 bg-white/50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 h-9 px-4 rounded-xl hover:bg-red-100 transition-all font-black uppercase tracking-widest text-[10px]"
                                leftIcon={<RefreshCw size={14} className="stroke-[2.5px]" />}
                            >
                                Retry Operation
                            </Button>
                        )}
                    </div>

                    {onClose && (
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-xl text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
