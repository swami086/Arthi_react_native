'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageIndicator } from '@/components/onboarding/page-indicator';
import { setOnboardingCompleted } from '@/app/actions/onboarding';
import { addBreadcrumb, reportInfo, reportError } from '@/lib/rollbar-utils';

export default function WelcomeClient() {
    const router = useRouter();
    const [isSkipping, setIsSkipping] = React.useState(false);

    const handleNext = () => {
        addBreadcrumb('Navigating to features page', 'onboarding.welcome', 'info');
        router.push('/onboarding/features');
    };

    const handleSkip = async () => {
        setIsSkipping(true);
        addBreadcrumb('User skipped onboarding from welcome', 'onboarding.welcome', 'info');

        try {
            const result = await setOnboardingCompleted();
            if (result.success) {
                localStorage.setItem('onboarding_completed', 'true');
                router.push('/login');
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            reportError(error, 'onboarding.welcome.skip');
            toast.error(error.message || 'Failed to skip onboarding. Please try again.');
            setIsSkipping(false);
        }
    };

    React.useEffect(() => {
        const completed = localStorage.getItem('onboarding_completed');
        if (completed === 'true') {
            router.push('/login');
            return;
        }
        reportInfo('Onboarding welcome page viewed', 'onboarding.welcome');
    }, [router]);


    return (
        <div className="min-h-screen flex flex-col justify-between p-6 bg-background-light dark:bg-background-dark">
            {/* Skip Button */}
            <div className="flex justify-end pt-2">
                <button
                    onClick={handleSkip}
                    disabled={isSkipping}
                    className="py-2 px-4 text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors disabled:opacity-50"
                >
                    Skip
                </button>
            </div>

            {/* Hero Content */}
            <motion.div
                initial="initial"
                animate="animate"
                variants={{
                    animate: {
                        transition: {
                            staggerChildren: 0.2,
                            delayChildren: 0.3,
                        },
                    },
                }}
                className="flex flex-col items-center gap-8"
            >
                <motion.div
                    variants={{
                        initial: { opacity: 0, scale: 0.9 },
                        animate: { opacity: 1, scale: 1 },
                    }}
                    className="w-full aspect-square rounded-[32px] overflow-hidden shadow-2xl shadow-primary/20 relative"
                >
                    <Image
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeii2IgyATXOOrSDdedqXOSd8WlrRVLLL29GRV7d0237RECOVtWzAkg0Ypw1AXqWhrXniFxY_uFCZozdHDdPdmZpah9EdnyjMerN9vZgjUxH9SHD9sfeNcJLVC3rdYNZ4DUX2O3lAiNnrbq2kFfmubOM1OUVfFl2ad8ZOctwADy0kuuOA67OuHZGO8XBOlKHr0ChTkPI_GXPpjmBnAJOS_T96UjVW4qoYwObSCcGtA0nogkBTgwJM4MGrFghDQbFgjuamgFkljSaan"
                        alt="Welcome to SafeSpace"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-primary/10" />
                </motion.div>

                <div className="flex flex-col gap-4 text-center">
                    <motion.h1
                        variants={{
                            initial: { opacity: 0, y: 10 },
                            animate: { opacity: 1, y: 0 },
                        }}
                        className="text-[32px] font-extrabold leading-tight tracking-tight text-text-primary-light dark:text-text-primary-dark"
                    >
                        Therapisting, <span className="text-primary dark:text-primary-dark">Not Therapy</span>
                    </motion.h1>
                    <motion.p
                        variants={{
                            initial: { opacity: 0, y: 10 },
                            animate: { opacity: 1, y: 0 },
                        }}
                        className="text-text-secondary-light dark:text-text-secondary-dark text-base font-medium leading-relaxed max-w-[320px] mx-auto"
                    >
                        Life can be overwhelmed. We provide a judgment-free zone where you can talk to real therapists and build skills for the future.
                    </motion.p>
                </div>
            </motion.div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-8">
                <PageIndicator totalPages={3} currentPage={0} />
                <Button
                    onClick={handleNext}
                    className="px-8 h-14 rounded-2xl shadow-lg shadow-primary/20"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
