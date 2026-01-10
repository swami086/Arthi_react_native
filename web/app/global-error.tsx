'use client';
import { useEffect } from 'react';
import Rollbar from 'rollbar';
import { rollbarConfig } from '@/lib/rollbar';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
    useEffect(() => {
        const rollbar = new Rollbar(rollbarConfig);
        rollbar.error(error);
    }, [error]);

    return (
        <html>
            <body className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <h2 className="text-3xl font-bold tracking-tight">Something went wrong!</h2>
                    <p className="text-muted-foreground">
                        A critical error occurred. We've been notified and are looking into it.
                    </p>
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
