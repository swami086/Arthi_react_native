'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { reportError } from '@/lib/rollbar-utils';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TherapistDetailError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        reportError(error, 'therapist_detail.error_boundary', { digest: error.digest });
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-500 mb-6">
                <AlertTriangle size={40} />
            </div>

            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">
                Profile Unavailable
            </h2>

            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                We couldn't load this therapist's profile information. It might be a temporary issue or the profile no longer exists.
            </p>

            <div className="flex gap-4">
                <Button
                    onClick={reset}
                    variant="primary"
                >
                    Try Again
                </Button>

                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    leftIcon={<ArrowLeft size={16} />}
                >
                    Go Back
                </Button>
            </div>
        </div>
    );
}
