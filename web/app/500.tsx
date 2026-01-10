'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Server, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reportError, getTraceId } from '@/lib/rollbar-utils';

export default function InternalServerError() {
    const [incidentId, setIncidentId] = useState<string>('');
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        const id = getTraceId();
        setIncidentId(id || 'unknown');

        reportError(new Error('500 Internal Server Error'), 'app.500', {
            incident_id: id,
            path: window.location.pathname
        });
    }, []);

    const handleRetry = () => {
        setIsRetrying(true);
        window.location.reload();
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center dark:bg-gray-900">
            <div className="mx-auto max-w-md rounded-2xl bg-white p-10 shadow-xl dark:bg-gray-800">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
                    <Server className="h-10 w-10 text-red-500" />
                </div>

                <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
                    500
                </h1>
                <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
                    Internal Server Error
                </h2>

                <p className="mb-6 text-gray-600 dark:text-gray-400">
                    Something went wrong on our servers. We track these errors automatically, but if the problem persists, feel free to contact us.
                </p>

                {incidentId && (
                    <div className="mb-8 flex items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-mono">Incident ID: {incidentId}</span>
                    </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="gap-2 bg-primary hover:bg-primary/90"
                    >
                        {isRetrying ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        Reload Page
                    </Button>

                    <a
                        href="https://status.safespace.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                    >
                        System Status
                    </a>
                </div>
            </div>
        </div>
    );
}
