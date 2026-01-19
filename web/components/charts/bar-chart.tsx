'use client';

import React from 'react';
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Label
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BarChartProps {
    data: Array<{ category: string; value: number; label?: string }>;
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    color?: string;
    showGrid?: boolean;
    showTooltip?: boolean;
    height?: number;
    className?: string;
}

/**
 * BarChart component for visualizing categorical health data.
 * Powered by Recharts with custom TherapyFlow styling and rounded bar corners.
 */
export const BarChart: React.FC<BarChartProps> = ({
    data,
    title,
    xAxisLabel = 'Category',
    yAxisLabel = 'Count',
    color = '#0066FF',
    showGrid = true,
    showTooltip = true,
    height = 300,
    className
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "w-full bg-white dark:bg-[#1a2c32] p-6 rounded-3xl border border-gray-100 dark:border-border-dark shadow-sm",
                className
            )}
        >
            {title && (
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-6">
                    {title}
                </h3>
            )}

            <div style={{ width: '100%', height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        {showGrid && (
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="rgba(0,0,0,0.05)"
                                className="dark:stroke-white/5"
                            />
                        )}
                        <XAxis
                            dataKey="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                            dy={10}
                        >
                            {xAxisLabel && (
                                <Label
                                    value={xAxisLabel}
                                    offset={-15}
                                    position="insideBottom"
                                    style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', fill: '#94a3b8' }}
                                />
                            )}
                        </XAxis>
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                        >
                            {yAxisLabel && (
                                <Label
                                    value={yAxisLabel}
                                    angle={-90}
                                    position="insideLeft"
                                    offset={-5}
                                    style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', fill: '#94a3b8', textAnchor: 'middle' }}
                                />
                            )}
                        </YAxis>
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
                                cursor={{ fill: 'rgba(0,102,255,0.05)' }}
                            />
                        )}
                        <Bar
                            dataKey="value"
                            fill={color}
                            radius={[8, 8, 0, 0]}
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fillOpacity={0.8 + (index % 3) * 0.1} />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

BarChart.displayName = 'BarChart';
