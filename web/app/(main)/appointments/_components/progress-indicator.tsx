'use client';

import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
    currentStep: number; // 1, 2, or 3
}

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
    const steps = [1, 2, 3];

    return (
        <div className="flex flex-col items-center gap-2 mb-6">
            <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of 3
            </span>
            <div className="flex items-center gap-2">
                {steps.map((step) => {
                    const isActive = step === currentStep;
                    const isCompleted = step < currentStep;

                    return (
                        <motion.div
                            key={step}
                            initial={false}
                            animate={{
                                width: isActive ? 32 : 10,
                                opacity: isActive || isCompleted ? 1 : 0.3,
                                backgroundColor: isActive || isCompleted ? 'var(--primary)' : 'var(--muted-foreground)'
                            }}
                            className={`h-2.5 rounded-full ${isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
