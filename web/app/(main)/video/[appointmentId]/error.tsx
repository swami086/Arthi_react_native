'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Video Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background-light dark:bg-[#0e181b]">
            <div className="bg-white dark:bg-[#1a2a2e] p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100 dark:border-white/5">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Something went wrong
                </h2>

                <p className="text-slate-500 dark:text-[#94aeb8] mb-8 text-sm leading-relaxed">
                    We encountered an error while setting up your video session.
                    Please try again or contact support if the issue persists.
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={reset}
                        className="w-full bg-[#30bae8] hover:bg-[#30bae8]/90 text-white font-bold h-12 rounded-xl"
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => window.location.href = '/appointments'}
                        className="w-full text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                        Return to Dashboard
                    </Button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-slate-100 dark:bg-black/40 rounded-lg text-left overflow-auto max-h-40">
                        <p className="text-xs text-slate-500 font-mono break-all">
                            {error.message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
