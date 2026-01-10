'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface QuickActionButtonProps {
    icon: LucideIcon;
    label: string;
    href: string;
    color?: string; // tailwind color class prefix e.g 'blue' -> bg-blue-50 text-blue-600
}

export function QuickActionButton({ icon: Icon, label, href, color = "primary" }: QuickActionButtonProps) {
    const colorClasses = {
        primary: "bg-primary/10 text-primary dark:bg-primary/20",
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
        red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    }[color] || "bg-gray-100 text-gray-600";

    return (
        <Link href={href} className="flex flex-col items-center gap-2 group">
            <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm transition-shadow group-hover:shadow-md ${colorClasses}`}
            >
                <Icon className="h-6 w-6" />
            </motion.button>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors">
                {label}
            </span>
        </Link>
    );
}
