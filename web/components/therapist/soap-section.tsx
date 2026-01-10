'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SoapSectionProps {
    title: string;
    icon: React.ReactNode;
    color: string;
    content: string;
    onChange: (value: string) => void;
    isEditing?: boolean;
    minChars?: number;
}

export function SoapSection({
    title,
    icon,
    color,
    content,
    onChange,
    isEditing = true,
    minChars = 50
}: SoapSectionProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [charCount, setCharCount] = useState(content.length);
    const isValid = charCount >= minChars;

    useEffect(() => {
        setCharCount(content.length);
    }, [content]);

    return (
        <div className="bg-white dark:bg-[#1a2c32] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-4 transition-all duration-200 hover:shadow-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/20"
            >
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", color)}>
                        {icon}
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {charCount} characters
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {content.length > 0 && (
                        <div className={cn(
                            "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                            isValid
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        )}>
                            {isValid ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            <span>{isValid ? "Valid" : "Too short"}</span>
                        </div>
                    )}
                    {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="p-4">
                            <textarea
                                value={content}
                                onChange={(e) => onChange(e.target.value)}
                                disabled={!isEditing}
                                className="w-full min-h-[150px] p-4 rounded-lg bg-gray-50 dark:bg-[#111d21] border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-y text-sm leading-relaxed text-gray-700 dark:text-gray-300 transition-colors"
                                placeholder={`Enter ${title.toLowerCase()}...`}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
