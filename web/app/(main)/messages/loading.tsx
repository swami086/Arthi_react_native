import React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function MessagesLoading() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                    <div className="h-4 w-32 bg-gray-100 dark:bg-gray-900 rounded-lg animate-pulse" />
                </div>
                <div className="h-13 w-full md:w-80 bg-gray-100 dark:bg-gray-900 rounded-2xl animate-pulse" />
            </div>

            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center p-4 bg-white dark:bg-[#1a2c32] rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm">
                        <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse mr-4" />
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between">
                                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                <div className="h-3 w-16 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
                            </div>
                            <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
