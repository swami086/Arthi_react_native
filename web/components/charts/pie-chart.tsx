'use client';

import React from 'react';
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface PieChartProps {
    data: Array<{ category: string; value: number; color?: string }>;
    title?: string;
    showLegend?: boolean;
    showTooltip?: boolean;
    height?: number;
    className?: string;
}

const DEFAULT_COLORS = ['#0066FF', '#7C3AED', '#EC4899', '#10B981', '#F59E0B'];

/**
 * PieChart component for visualizing data distribution.
 * Powered by Recharts with custom TherapyFlow styling.
 */
export const PieChart: React.FC<PieChartProps> = ({
    data,
    title,
    showLegend = true,
    showTooltip = true,
    height = 300,
    className
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "w-full bg-white dark:bg-[#1a2c32] p-6 rounded-3xl border border-gray-100 dark:border-border-dark shadow-sm",
                className
            )}
        >
            {title && (
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-6 text-center">
                    {title}
                </h3>
            )}

            <div style={{ width: '100%', height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="category"
                            animationDuration={1500}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                                />
                            ))}
                        </Pie>
                        {showTooltip && (
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a2c32',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                                itemStyle={{
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: 900,
                                    textTransform: 'uppercase'
                                }}
                            />
                        )}
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                align="center"
                                iconType="circle"
                                wrapperStyle={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    paddingTop: '20px'
                                }}
                            />
                        )}
                    </RechartsPieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

PieChart.displayName = 'PieChart';
