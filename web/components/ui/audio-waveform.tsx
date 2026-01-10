'use client';

import { motion } from 'framer-motion';
import { colors } from '@/design-system/tokens';

interface AudioWaveformProps {
    isRecording: boolean;
    audioLevel: number;
    barCount?: number;
    className?: string;
}

export function AudioWaveform({
    isRecording,
    audioLevel,
    barCount = 20,
    className
}: AudioWaveformProps) {
    const bars = Array.from({ length: barCount }, (_, i) => i);

    return (
        <div className={`flex items-center gap-1 h-8 ${className}`}>
            {bars.map((i) => {
                // Determine height based on audio level and some randomness
                let height = 4; // minimum height

                if (isRecording) {
                    // Create a wave effect from center
                    const center = barCount / 2;
                    const distance = Math.abs(i - center);
                    const normalizedDist = 1 - (distance / center);

                    // Add randomness
                    const random = Math.random() * 0.5 + 0.5;

                    // Calculate height (max height 32px)
                    const levelFactor = Math.min(audioLevel / 50, 1); // Normalize 0-255 to 0-1 (approx)
                    height = 4 + (28 * levelFactor * normalizedDist * random);
                }

                return (
                    <motion.div
                        key={i}
                        className="w-1 rounded-full bg-[#30bae8]"
                        animate={{ height }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 15,
                        }}
                        style={{
                            backgroundColor: colors.primary.DEFAULT
                        }}
                    />
                );
            })}
        </div>
    );
}
