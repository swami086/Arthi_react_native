'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reportError } from '@/lib/rollbar-utils';
import Link from 'next/link';

export default function MessagesError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        reportError(error, 'MessagesRootError');
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center max-w-xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-24 w-24 rounded-[2.5rem] bg-red-50 text-red-500 flex items-center justify-center mb-8 shadow-xl shadow-red-500/10"
            >
                <AlertCircle className="h-12 w-12" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                    Connection <span className="text-red-500">Lost</span>
                </h2>
                <p className="text-gray-500 font-bold mb-10 leading-relaxed">
                    We encountered an error while trying to load your conversations. This has been reported to our technical team.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => reset()}
                        variant="primary"
                        className="h-15 px-10 rounded-2xl font-black shadow-lg shadow-primary/20 gap-3"
                    >
                        <RefreshCcw className="h-5 w-5" />
                        Try Again
                    </Button>
                    <Link href="/home">
                        <Button
                            variant="outline"
                            className="h-15 px-10 rounded-2xl font-black border-gray-100 dark:border-gray-800 gap-3 bg-white dark:bg-gray-950"
                        >
                            <Home className="h-5 w-5" />
                            Return Home
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
