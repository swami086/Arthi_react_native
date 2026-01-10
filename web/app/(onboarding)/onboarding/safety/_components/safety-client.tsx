'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageIndicator } from '@/components/onboarding/page-indicator';
import { setOnboardingCompleted } from '@/app/actions/onboarding';
import { addBreadcrumb, reportInfo, reportError } from '@/lib/rollbar-utils';

export default function SafetyClient() {
    const router = useRouter();
    const [isFinishing, setIsFinishing] = React.useState(false);

    const handleFinish = async () => {
        setIsFinishing(true);
        addBreadcrumb('Completing onboarding flow', 'onboarding.safety', 'info');

        try {
            const result = await setOnboardingCompleted();
            if (result.success) {
                localStorage.setItem('onboarding_completed', 'true');
                router.push('/signup');
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            reportError(error, 'onboarding.safety.finish');
            toast.error(error.message || 'Failed to complete onboarding. Please try again.');
            setIsFinishing(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    React.useEffect(() => {
        const completed = localStorage.getItem('onboarding_completed');
        if (completed === 'true') {
            router.push('/signup');
            return;
        }
        reportInfo('Onboarding safety page viewed', 'onboarding.safety');
    }, [router]);


    return (
        <div className="min-h-screen flex flex-col justify-between p-6 bg-background-light dark:bg-background-dark">
            <div className="flex flex-col flex-1">
                {/* Header Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-60 rounded-[32px] overflow-hidden shadow-2xl shadow-primary/10 relative mb-8"
                >
                    <Image
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeii2IgyATXOOrSDdedqXOSd8WlrRVLLL29GRV7d0237RECOVtWzAkg0Ypw1AXqWhrXniFxY_uFCZozdHDdPdmZpah9EdnyjMerN9vZgjUxH9SHD9sfeNcJLVC3rdYNZ4DUX2O3lAiNnrbq2kFfmubOM1OUVfFl2ad8ZOctwADy0kuuOA67OuHZGO8XBOlKHr0ChTkPI_GXPpjmBnAJOS_T96UjVW4qoYwObSCcGtA0nogkBTgwJM4MGrFghDQbFgjuamgFkljSaan"
                        alt="Safety and Support"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                </motion.div>

                {/* Content Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col gap-6"
                >
                    <div className="text-center">
                        <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-text-primary-light dark:text-text-primary-dark mb-3">
                            Safe, Secure, & Supported
                        </h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-medium leading-relaxed">
                            We are here to listen, but your safety comes first. We've built a space where you can grow without worry.
                        </p>
                    </div>

                    {/* Safety Cards Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-border-light/50 dark:border-border-dark/50 flex flex-col gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark tracking-tight">
                                Crisis Resources
                            </h3>
                            <p className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark leading-tight">
                                Need help now? Access resource center 24/7.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-border-light/50 dark:border-border-dark/50 flex flex-col gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-secondary-light/10 flex items-center justify-center text-secondary-light">
                                <Lock className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark tracking-tight">
                                Privacy Promise
                            </h3>
                            <p className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark leading-tight">
                                Your chats are private. We use encryption.
                            </p>
                        </motion.div>
                    </div>

                    {/* Disclaimer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex items-start gap-2 p-3 rounded-xl bg-status-warning/10 border border-status-warning/20 mt-2"
                    >
                        <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                        <p className="text-[10px] font-semibold text-status-warning/80 leading-tight">
                            Note: This platform offers coaching and mentoring, not emergency medical services.
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-8">
                <button
                    onClick={handleBack}
                    className="py-2 px-4 text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
                >
                    Back
                </button>
                <PageIndicator totalPages={3} currentPage={2} />
                <Button
                    onClick={handleFinish}
                    isLoading={isFinishing}
                    className="px-6 h-14 rounded-2xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary-dark"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                    Get Started
                </Button>
            </div>
        </div>
    );
}
