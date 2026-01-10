'use client';

import { Button } from "@/components/ui/button";
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { reportError } from '@/lib/rollbar-utils';
import { useEffect } from 'react';

export default function ProfileError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        reportError(error, 'Profile page error boundary');
    }, [error]);

    return (
        <div className="flex items-center justify-center min-vh-100 p-6">
            <ErrorBoundary context="profile_page">
                <div className="text-center py-20 px-6">
                    <h2 className="text-xl font-bold mb-4">Something went wrong while loading your profile</h2>
                    <Button onClick={reset}>Try again</Button>
                </div>
            </ErrorBoundary>
        </div>
    );
}
