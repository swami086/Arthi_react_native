'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { reportError } from '@/lib/rollbar-utils';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to Rollbar
        reportError(error, 'PaymentsPage:ErrorBoundary');
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong!</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    We encountered an error while loading your payment data. This has been reported to our team.
                </p>
            </div>
            <Button
                onClick={() => reset()}
                className="gap-2"
                variant="primary"
            >
                <RefreshCw className="h-4 w-4" />
                Try again
            </Button>
        </div>
    );
}
