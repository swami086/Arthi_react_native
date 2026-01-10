import { LucideIcon } from 'lucide-react';

interface MetadataCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    icon?: LucideIcon;
    className?: string;
}

export function MetadataCard({ label, value, subtext, icon: Icon, className = '' }: MetadataCardProps) {
    return (
        <div className={`bg-white dark:bg-[#1a2c32] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm ${className}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</p>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{value}</h3>
                    {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
                </div>
                {Icon && (
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                )}
            </div>
        </div>
    );
}
