'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Home, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reportError } from '@/lib/rollbar-utils';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        // Log to Rollbar with digest if available
        reportError(error, 'app.error', { digest: error.digest });
    }, [error]);

    const handleRetry = async () => {
        setIsRetrying(true);
        // Add exponential backoff simulation if needed, but for now just invoke reset
        try {
            await reset();
        } finally {
            setTimeout(() => setIsRetrying(false), 500); // minimal delay for UX
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center dark:bg-gray-900">
            <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
                </div>

                <h2 className="mb-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                    Something went wrong
                </h2>

                <p className="mb-6 text-gray-600 dark:text-gray-400">
                    We apologize for the inconvenience. Our team has been notified of this issue.
                </p>

                {error.digest && (
                    <div className="mb-6 rounded-lg bg-gray-100 p-3 text-xs font-mono text-gray-500 dark:bg-gray-900">
                        Error ID: {error.digest}
                    </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="gap-2"
                    >
                        {isRetrying ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        Try Again
                    </Button>

                    <Link href="/" passHref>
                        <Button variant="outline" className="gap-2 w-full sm:w-auto">
                            <Home className="h-4 w-4" />
                            Go Home
                        </Button>
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500">
                        Need help? <a href="mailto:support@safespace.com" className="text-primary hover:underline">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
