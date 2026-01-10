'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { reportError } from '@/lib/rollbar-utils';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomeError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        reportError(error, 'home_page.error_boundary', { digest: error.digest });
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-500/10 rounded-[32px] flex items-center justify-center text-red-500 mb-8 shadow-2xl shadow-red-500/10 rotate-12">
                <AlertCircle size={48} className="stroke-[2.5px]" />
            </div>

            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-4">
                Dashboard Malfunction
            </h2>

            <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto mb-10 font-medium leading-relaxed">
                We're having trouble loading your personal dashboard. It seems a data connection was interrupted.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none justify-center">
                <Button
                    onClick={reset}
                    className="h-14 px-8 rounded-2xl shadow-xl shadow-primary/20"
                    leftIcon={<RefreshCw size={18} className="stroke-[2.5px]" />}
                >
                    Retry Dashboard
                </Button>

                <Button
                    variant="outline"
                    onClick={() => router.push('/onboarding/welcome')} // Fallback to safe area if dashboard is totally broken
                    className="h-14 px-8 rounded-2xl border-gray-200 dark:border-border-dark"
                    leftIcon={<LayoutDashboard size={18} className="stroke-[2.5px]" />}
                >
                    Safe Mode
                </Button>
            </div>

            <p className="mt-12 text-xs font-mono text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                Error Digest: {error.digest || 'Unknown'}
            </p>
        </div>
    );
}
