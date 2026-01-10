'use client';

import { useEffect } from 'react';
import rollbar from '@/lib/rollbar';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        try {
            rollbar.error(error, {
                context: 'global_error_boundary',
                digest: error.digest,
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
        } catch (e) {
            console.error('Rollbar reporting failed:', e);
        }
    }, [error]);

    return (
        <html lang="en">
            <body className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-900 font-sans antialiased">
                <div className="max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
                    <div className="mb-6 flex justify-center">
                        <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold mb-4 text-gray-900">System Error</h1>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                        A critical system error has occurred. We have logged this incident and our engineering team is investigating.
                    </p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => reset()}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                            Reload Application
                        </button>

                        <a
                            href="mailto:emergency@safespace.com"
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Contact Emergency Support
                        </a>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <a href="https://status.safespace.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600 inline-flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Check System Status
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
