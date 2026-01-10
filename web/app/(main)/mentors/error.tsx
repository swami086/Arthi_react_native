'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { reportError } from '@/lib/rollbar-utils';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MentorsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        reportError(error, 'mentors_page.error_boundary', { digest: error.digest });
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-6">
                <AlertCircle size={40} />
            </div>

            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">
                Unable to Load Mentors
            </h2>

            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                We encountered a problem while fetching the mentor list.
                Please check your connection and try again.
            </p>

            <div className="flex gap-4">
                <Button
                    onClick={reset}
                    leftIcon={<RefreshCw size={16} />}
                >
                    Retry
                </Button>

                <Button
                    variant="outline"
                    onClick={() => router.push('/home')}
                    leftIcon={<Home size={16} />}
                >
                    Back to Home
                </Button>
            </div>
        </div>
    );
}
