'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    TrendingUp,
    TrendingDown,
    Minus,
    Calendar,
    Target,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface PatternCardProps {
    title: string;
    description: string;
    frequency: string;
    trend: 'increasing' | 'stable' | 'decreasing';
    confidence: number; // 0-100
    relatedSessions?: number;
    onClick?: () => void;
    className?: string;
}

/**
 * PatternCard component for displaying AI-detected behavioral insights.
 * Visualizes trends, confidence levels, and frequency of patterns.
 */
export const PatternCard: React.FC<PatternCardProps> = ({
    title,
    description,
    frequency,
    trend,
    confidence,
    relatedSessions,
    onClick,
    className
}) => {
    const trendConfig = {
        increasing: {
            icon: TrendingUp,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-900/10'
        },
        stable: {
            icon: Minus,
            color: 'text-yellow-500',
            bg: 'bg-yellow-50 dark:bg-yellow-900/10'
        },
        decreasing: {
            icon: TrendingDown,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-900/10'
        }
    };

    const config = trendConfig[trend] || trendConfig.stable;
    const TrendIcon = config.icon;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={cn("h-full cursor-pointer", className)}
            onClick={onClick}
        >
            <Card className="h-full border border-gray-100 dark:border-border-dark overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                            <div className={cn("p-2.5 rounded-2xl", config.bg, config.color)}>
                                <Zap className="w-5 h-5 fill-current" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 leading-tight">
                                    {title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-500">{frequency}</span>
                                </div>
                            </div>
                        </div>
                        <div className={cn("flex flex-col items-end gap-1.5", config.color)}>
                            <TrendIcon className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{trend}</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-6 leading-relaxed">
                        {description}
                    </p>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <Target className="w-3 h-3" />
                                    AI Confidence
                                </div>
                                <span className="text-xs font-black text-primary">{confidence}%</span>
                            </div>
                            <Progress value={confidence} className="h-1.5" />
                        </div>

                        {relatedSessions !== undefined && (
                            <div className="flex items-center gap-2 pt-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.1em]">
                                <Calendar className="w-3.5 h-3.5" />
                                Observed in {relatedSessions} sessions
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

PatternCard.displayName = 'PatternCard';
