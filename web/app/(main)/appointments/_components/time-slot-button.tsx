'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlotButtonProps {
    time: string;
    endTime?: string;
    isSelected: boolean;
    onPress: () => void; // Keeping prop name from plan, though onClick is standard web
    disabled?: boolean;
}

export default function TimeSlotButton({
    time,
    endTime,
    isSelected,
    onPress,
    disabled
}: TimeSlotButtonProps) {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            onClick={onPress}
            disabled={disabled}
            className={cn(
                "relative flex flex-col items-center justify-center p-3 rounded-xl border transition-colors",
                "h-[80px] w-full",
                isSelected
                    ? "bg-primary border-primary text-primary-foreground shadow-md"
                    : "bg-card border-border hover:border-primary/50 text-card-foreground",
                disabled && "opacity-50 cursor-not-allowed bg-muted/50"
            )}
        >
            <span className={cn(
                "text-lg font-semibold",
                isSelected ? "text-white" : "text-foreground"
            )}>
                {time}
            </span>
            {/* Optional endTime display if needed */}
            {endTime && (
                <span className={cn(
                    "text-xs",
                    isSelected ? "text-white/80" : "text-muted-foreground"
                )}>
                    - {endTime}
                </span>
            )}

            {isSelected && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-1 right-1"
                >
                    <Check className="w-4 h-4 text-white" />
                </motion.div>
            )}
        </motion.button>
    );
}
