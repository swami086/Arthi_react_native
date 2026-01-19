'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { TagPill } from '@/components/ui/tag-pill';

export interface InterventionCardProps {
    title: string;
    type: 'CBT' | 'DBT' | 'ACT' | 'Other';
    description: string;
    steps: string[];
    onApply: () => void;
    className?: string;
}

/**
 * InterventionCard component for displaying specialized therapy techniques.
 * Features modality-based color coding and interactive steps.
 */
export const InterventionCard: React.FC<InterventionCardProps> = ({
    title,
    type,
    description,
    steps,
    onApply,
    className
}) => {
    const typeStyles = {
        CBT: {
            bg: 'bg-blue-50 dark:bg-blue-900/30',
            text: 'text-blue-600 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-800',
            accent: 'border-l-blue-500',
            pillColor: 'blue' as const
        },
        DBT: {
            bg: 'bg-purple-50 dark:bg-purple-900/30',
            text: 'text-purple-600 dark:text-purple-300',
            border: 'border-purple-200 dark:border-purple-800',
            accent: 'border-l-purple-500',
            pillColor: 'purple' as const
        },
        ACT: {
            bg: 'bg-green-50 dark:bg-green-900/30',
            text: 'text-green-600 dark:text-green-300',
            border: 'border-green-200 dark:border-green-800',
            accent: 'border-l-green-500',
            pillColor: 'green' as const
        },
        Other: {
            bg: 'bg-gray-50 dark:bg-gray-900/30',
            text: 'text-gray-600 dark:text-gray-300',
            border: 'border-gray-200 dark:border-gray-800',
            accent: 'border-l-gray-500',
            pillColor: 'gray' as const
        }
    };

    const style = typeStyles[type] || typeStyles.Other;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={cn("h-full", className)}
        >
            <Card className={cn(
                "h-full flex flex-col border-l-4 overflow-hidden transition-all duration-300 hover:shadow-lg",
                style.accent,
                style.bg
            )}>
                <CardHeader className="flex flex-row justify-between items-start pb-2">
                    <div className="space-y-1">
                        <TagPill label={type} color={style.pillColor} />
                        <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mt-2">
                            {title}
                        </h3>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {description}
                    </p>
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Technique Steps</p>
                        <ul className="space-y-2">
                            {steps.map((step, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                                    <CheckCircle2 className={cn("w-4 h-4 mt-0.5 shrink-0", style.text)} />
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-black/5 dark:border-white/5">
                    <Button
                        onClick={onApply}
                        className="w-full font-bold uppercase tracking-widest text-xs"
                    >
                        Apply Intervention
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

InterventionCard.displayName = 'InterventionCard';
