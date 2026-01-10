'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, LogOut, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/actions/auth';
import { addBreadcrumb } from '@/lib/rollbar-utils';

export default function PendingApprovalContent() {
    const handleSignOut = async () => {
        addBreadcrumb('Sign out from pending approval', 'auth.pending', 'info');
        await signOut();
    };

    return (
        <div className="flex flex-col items-center text-center space-y-8">
            <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 3
                }}
                className="w-24 h-24 bg-secondary/10 rounded-3xl flex items-center justify-center"
            >
                <Clock className="w-12 h-12 text-secondary" />
            </motion.div>

            <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
                    Account Under Review
                </h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-sm mx-auto leading-relaxed">
                    Your mentor profile is currently being reviewed by our clinical team. This process usually takes 24-48 hours.
                </p>
            </div>

            <div className="w-full space-y-4">
                <div className="p-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl flex items-start gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-sm text-text-primary-light dark:text-text-primary-dark">Email Notification</h3>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                            We'll send an email to your registered address once the approval process is complete.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        variant="outline"
                        className="w-full h-12 border-border-light dark:border-border-dark"
                        onClick={handleSignOut}
                        leftIcon={<LogOut className="w-4 h-4" />}
                    >
                        Sign Out
                    </Button>

                    <a
                        href="mailto:support@safespace.com"
                        className="inline-flex items-center justify-center gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors py-2"
                    >
                        Contact Support
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}
