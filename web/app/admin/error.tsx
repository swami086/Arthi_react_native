'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reportError } from '@/lib/rollbar-utils';
import Link from 'next/link';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        reportError(error, 'AdminRootError');
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center max-w-xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-24 w-24 rounded-[2.5rem] bg-red-100 text-red-600 flex items-center justify-center mb-8 shadow-xl shadow-red-500/10"
            >
                <AlertTriangle className="h-12 w-12" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                    Administrative <span className="text-red-600">Halt</span>
                </h2>
                <p className="text-gray-500 font-bold mb-8 leading-relaxed">
                    Something went wrong while processing administrative data. This incident has been logged and reported to the engineering team.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => reset()}
                        variant="primary"
                        className="h-14 px-8 rounded-2xl font-black shadow-lg shadow-primary/20 gap-2"
                    >
                        <RefreshCcw className="h-5 w-5" />
                        Try Again
                    </Button>
                    <Link href="/admin/dashboard">
                        <Button
                            variant="outline"
                            className="h-14 px-8 rounded-2xl font-black border-gray-100 dark:border-gray-800 gap-2"
                        >
                            <Home className="h-5 w-5" />
                            Return Dashboard
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
