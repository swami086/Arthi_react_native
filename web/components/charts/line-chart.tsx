'use client';

import React from 'react';
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Label
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface LineChartProps {
    data: Array<{ date: string; value: number; label?: string }>;
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
 * LineChart component for visualizing time-series health data.
 * Powered by Recharts with custom TherapyFlow styling and animations.
 */
export const LineChart: React.FC<LineChartProps> = ({
    data,
    title,
    xAxisLabel = 'Date',
    yAxisLabel = 'Value',
    color = '#0066FF',
    showGrid = true,
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
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-6">
                    {title}
                </h3>
            )}

            <div style={{ width: '100%', height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        {showGrid && (
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="rgba(0,0,0,0.05)"
                                className="dark:stroke-white/5"
                            />
                        )}
                        <XAxis
                            dataKey="date"
                            tickFormatter={(val) => {
                                try {
                                    return format(parseISO(val), 'MMM d');
                                } catch {
                                    return val;
                                }
                            }}
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
                                labelStyle={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    marginBottom: '4px'
                                }}
                            />
                        )}
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={4}
                            dot={{ r: 6, fill: color, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 8, strokeWidth: 0, shadow: '0 0 10px rgba(0,0,0,0.2)' }}
                            animationDuration={1500}
                        />
                    </RechartsLineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

LineChart.displayName = 'LineChart';
