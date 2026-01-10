'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { reportError } from '@/lib/rollbar-utils';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        reportError(error, 'appointments.error_boundary');
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
            <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground mb-4">We couldn't load the appointment information.</p>
            <Button onClick={() => reset()}>Try again</Button>
        </div>
    );
}
