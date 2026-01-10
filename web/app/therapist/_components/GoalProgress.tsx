'use client';

import { motion } from 'framer-motion';

interface GoalProgressProps {
    title: string;
    progress: number; // 0-100
    date?: string;
    onClick?: () => void;
}

export function GoalProgress({ title, progress, date, onClick }: GoalProgressProps) {
    return (
        <div
            className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={onClick}
        >
            <div className="flex justify-between items-center mb-2">
                <h5 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h5>
                <span className="text-xs font-semibold text-primary">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full"
                />
            </div>
            {date && <p className="text-xs text-gray-500 mt-2">Target: {date}</p>}
        </div>
    );
}
