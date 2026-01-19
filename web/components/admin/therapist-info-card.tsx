
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Field {
    label: string;
    value: React.ReactNode;
    isFullWidth?: boolean;
}

interface TherapistInfoCardProps {
    title: string;
    icon: LucideIcon;
    fields: Field[];
    className?: string;
}

export function TherapistInfoCard({
    title,
    icon: Icon,
    fields,
    className
}: TherapistInfoCardProps) {
    return (
        <div className={cn("bg-white dark:bg-[#1a2c32] rounded-[2.5rem] p-8 border border-gray-100 dark:border-border-dark shadow-sm", className)}>
            <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tight">{title}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {fields.map((field, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "flex flex-col gap-1",
                            field.isFullWidth ? "md:col-span-2" : ""
                        )}
                    >
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{field.label}</span>
                        <div className="font-medium text-gray-900 dark:text-gray-200 text-base">
                            {field.value || <span className="text-gray-400 italic">Not provided</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
