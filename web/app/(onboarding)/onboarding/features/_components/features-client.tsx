'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, MessageCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { PageIndicator } from '@/components/onboarding/page-indicator';
import { FeatureCard } from '@/components/onboarding/feature-card';
import { addBreadcrumb, reportInfo } from '@/lib/rollbar-utils';

const features = [
    {
        id: 1,
        icon: <Users className="w-7 h-7" />,
        title: 'Connect with Mentors',
        description: 'Real people ready to listen, not just analyze your situation.'
    },
    {
        id: 2,
        icon: <Calendar className="w-7 h-7" />,
        title: 'Easy Scheduling',
        description: 'Book a session that fits your school life seamlessly.'
    },
    {
        id: 3,
        icon: <MessageCircle className="w-7 h-7" />,
        title: 'Safe Chat',
        description: 'Drop a message whenever you need to be heard instantly.'
    }
];

export default function FeaturesClient() {
    const router = useRouter();

    const handleNext = () => {
        addBreadcrumb('Navigating to safety page', 'onboarding.features', 'info');
        router.push('/onboarding/safety');
    };

    const handleBack = () => {
        router.back();
    };

    React.useEffect(() => {
        const completed = localStorage.getItem('onboarding_completed');
        if (completed === 'true') {
            router.push('/login');
            return;
        }
        reportInfo('Onboarding features page viewed', 'onboarding.features');
    }, [router]);


    return (
        <div className="min-h-screen flex flex-col justify-between p-6 bg-background-light dark:bg-background-dark">
            <div className="flex flex-col flex-1">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center pt-8 mb-10"
                >
                    <div className="w-16 h-1.5 bg-primary/20 rounded-full mb-8" />
                    <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-text-primary-light dark:text-text-primary-dark text-center mb-3">
                        What to expect
                    </h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-medium text-center max-w-[280px]">
                        Here are the tools available to help you navigate your journey.
                    </p>
                </motion.div>

                {/* Features List */}
                <div className="flex flex-col gap-4">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.id}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            delay={index * 0.15 + 0.3}
                        />
                    ))}
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-8">
                <button
                    onClick={handleBack}
                    className="py-2 px-4 text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
                >
                    Back
                </button>
                <PageIndicator totalPages={3} currentPage={1} />
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
