'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { reportInfo } from '@/lib/rollbar-utils';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function NotFound() {
    const pathname = usePathname();

    useEffect(() => {
        reportInfo('404 Page Visited', 'navigation.not_found', {
            path: pathname,
            referrer: typeof document !== 'undefined' ? document.referrer : ''
        });
    }, [pathname]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center dark:bg-gray-900">
            <div className="mx-auto max-w-lg rounded-3xl bg-white p-12 shadow-2xl dark:bg-gray-800">
                <div className="mb-8 text-9xl font-black text-gray-200 dark:text-gray-700">
                    404
                </div>

                <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Page Not Found</h2>
                <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                    <Button
                        onClick={() => { if (typeof window !== 'undefined') window.history.back() }}
                        variant="outline"
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>

                    <Link href="/" passHref legacyBehavior>
                        <Button className="gap-2 bg-primary hover:bg-primary/90">
                            <Home className="h-4 w-4" />
                            Home Page
                        </Button>
                    </Link>
                </div>

                <div className="mt-12 text-left">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Suggested Pages</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/home" className="rounded-lg bg-gray-50 p-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700">
                            User Dashboard
                        </Link>
                        <Link href="/therapist/home" className="rounded-lg bg-gray-50 p-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700">
                            Therapist Dashboard
                        </Link>
                        <Link href="/login" className="rounded-lg bg-gray-50 p-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700">
                            Login
                        </Link>
                        <Link href="/signup" className="rounded-lg bg-gray-50 p-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
