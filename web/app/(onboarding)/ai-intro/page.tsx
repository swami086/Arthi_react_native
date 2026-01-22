'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Bot,
    ShieldCheck,
    Sparkles,
    MessageSquare,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
    {
        title: "Meet Your AI Concierge",
        description: "Standardized on GPT-4o, our assistants help you manage scheduling, track progress, and stay connected between sessions.",
        icon: Bot,
        color: "text-primary"
    },
    {
        title: "Privacy First",
        description: "Your safety is our priority. All AI interactions are HIPAA-compliant, encrypted, and designed with clinical guardrails.",
        icon: ShieldCheck,
        color: "text-blue-500"
    },
    {
        title: "Context-Aware Memory",
        description: "Our RAG system allows agents to remember your goals and patterns, providing highly personalized support for your unique journey.",
        icon: Sparkles,
        color: "text-purple-500"
    }
];

export default function AIOnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const router = useRouter();

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            router.push('/ai-assistant');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
            <div className="max-w-xl w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8 text-center"
                    >
                        <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-[40px] shadow-xl border-2 border-border flex items-center justify-center mx-auto relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                            {React.createElement(STEPS[currentStep].icon, {
                                className: `w-12 h-12 ${STEPS[currentStep].color} relative z-10`
                            })}
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl font-black tracking-tight">{STEPS[currentStep].title}</h1>
                            <p className="text-lg font-medium text-foreground-muted leading-relaxed">
                                {STEPS[currentStep].description}
                            </p>
                        </div>

                        <div className="flex justify-center gap-2">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-2 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-primary' : 'w-2 bg-slate-200 dark:bg-zinc-800'}`}
                                />
                            ))}
                        </div>

                        <div className="pt-8">
                            <Button
                                onClick={handleNext}
                                size="lg"
                                className="w-full h-16 rounded-3xl text-lg font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3"
                            >
                                {currentStep === STEPS.length - 1 ? "Start Exploring" : "Continue"}
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <p className="mt-12 text-center text-xs font-black uppercase tracking-widest text-foreground-muted/40">
                    SafeSpace AI • GPT-4o Standard • HIPAA Compliant
                </p>
            </div>
        </div>
    );
}
