'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, History, Activity } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface RiskAlertProps {
    type: 'self-harm' | 'suicide' | 'harm-to-others' | 'substance-abuse';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detectedAt: string; // ISO timestamp
    onOpenAssessment?: () => void;
    onFlagForReview?: () => void;
    className?: string;
}

/**
 * RiskAlert component for displaying critical patient safety indicators.
 * Features urgent visual cues, pulse animations for critical alerts, and quick actions.
 */
export const RiskAlert: React.FC<RiskAlertProps> = ({
    type,
    severity,
    description,
    detectedAt,
    onOpenAssessment,
    onFlagForReview,
    className
}) => {
    const severityConfig = {
        low: {
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-200 dark:border-yellow-800',
            accent: 'bg-yellow-400',
            text: 'text-yellow-700 dark:text-yellow-400',
            icon: AlertTriangle
        },
        medium: {
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            border: 'border-orange-200 dark:border-orange-800',
            accent: 'bg-orange-500',
            text: 'text-orange-700 dark:text-orange-400',
            icon: ShieldAlert
        },
        high: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            accent: 'bg-red-500',
            text: 'text-red-700 dark:text-red-400',
            icon: AlertTriangle
        },
        critical: {
            bg: 'bg-red-100 dark:bg-red-900/40',
            border: 'border-red-300 dark:border-red-700',
            accent: 'bg-red-600',
            text: 'text-red-800 dark:text-red-300',
            icon: Activity,
            animate: true
        }
    };

    const config = severityConfig[severity] || severityConfig.low;
    const Icon = config.icon;
    const timeAgo = formatDistanceToNow(parseISO(detectedAt), { addSuffix: true });

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
                "relative overflow-hidden rounded-2xl border-l-4 p-5 shadow-sm transition-all",
                config.bg,
                config.border,
                severity === 'critical' && "animate-pulse shadow-red-500/10 shadow-lg",
                className
            )}
        >
            {severity === 'critical' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-red-500/5 pointer-events-none"
                />
            )}

            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", config.accent, "text-white")}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", config.text)}>
                            {severity} risk detected
                        </span>
                        <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase mt-0.5">
                            {type.replace(/-/g, ' ')}
                        </h4>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                    <History className="w-3 h-3" />
                    {timeAgo}
                </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed mb-4">
                {description}
            </p>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-black/5 dark:border-white/5">
                {onOpenAssessment && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenAssessment}
                        className="bg-white/50 dark:bg-black/20 border-gray-200 dark:border-gray-700 text-xs font-black uppercase"
                    >
                        Open Assessment
                    </Button>
                )}
                {onFlagForReview && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onFlagForReview}
                        className={cn("text-xs font-black uppercase", config.accent)}
                    >
                        Flag for Review
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

RiskAlert.displayName = 'RiskAlert';
