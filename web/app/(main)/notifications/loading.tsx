import React from 'react';

export default function NotificationsLoading() {
    return (
        <div className="max-w-3xl mx-auto space-y-8 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-900 rounded-lg animate-pulse" />
                </div>
                <div className="h-12 w-32 bg-gray-100 dark:bg-gray-900 rounded-2xl animate-pulse" />
            </div>

            <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex gap-4 p-5 rounded-[2rem] border border-gray-100 dark:border-border-dark bg-white dark:bg-[#1a2c32]">
                        <div className="h-14 w-14 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-3 py-1">
                            <div className="flex justify-between items-center">
                                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                <div className="h-3 w-16 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
                            </div>
                            <div className="h-3 w-full bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
                            <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
