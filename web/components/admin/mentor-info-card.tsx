'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MentorInfoCardProps {
    title: string;
    icon: LucideIcon;
    fields: {
        label: string;
        value: string | number | null | undefined;
        isFullWidth?: boolean;
    }[];
}

export function MentorInfoCard({ title, icon: Icon, fields }: MentorInfoCardProps) {
    return (
        <div className="bg-white dark:bg-[#1a2c32] rounded-[2.5rem] p-8 border border-gray-100 dark:border-border-dark shadow-sm">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tight">{title}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                {fields.map((field, idx) => (
                    <div key={idx} className={field.isFullWidth ? "md:col-span-2" : ""}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                            {field.label}
                        </p>
                        <p className="text-gray-900 dark:text-gray-100 font-bold leading-relaxed whitespace-pre-wrap">
                            {field.value || <span className="text-gray-300 dark:text-gray-700 italic">Not Provided</span>}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
