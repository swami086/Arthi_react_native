'use client';

import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SliderProps {
    /** Minimum value */
    min?: number;
    /** Maximum value */
    max?: number;
    /** Step increment */
    step?: number;
    /** Current value(s) */
    value?: number[];
    /** Default value(s) */
    defaultValue?: number[];
    /** Value change callback */
    onValueChange?: (value: number[]) => void;
    /** Label text */
    label?: string;
    /** Show current value */
    showValue?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Additional className */
    className?: string;
    /** Value formatter function */
    formatValue?: (value: number) => string;
}

/**
 * Slider component wrapping Radix UI Slider with TherapyFlow design system
 */
export const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    SliderProps
>(
    (
        {
            min = 0,
            max = 100,
            step = 1,
            value,
            defaultValue,
            onValueChange,
            label,
            showValue = true,
            disabled = false,
            className,
            formatValue,
            ...props
        },
        ref
    ) => {
        const [internalValue, setInternalValue] = React.useState<number[]>(
            value || defaultValue || [min]
        );

        // Sync internal value with controlled value
        React.useEffect(() => {
            if (value !== undefined) {
                setInternalValue(value);
            }
        }, [value]);

        const handleValueChange = (newValue: number[]) => {
            setInternalValue(newValue);
            onValueChange?.(newValue);
        };

        const displayValue = internalValue[0];
        const formattedValue = formatValue
            ? formatValue(displayValue)
            : Number.isInteger(step)
                ? displayValue.toString()
                : displayValue.toFixed(1);

        return (
            <div className={cn('flex flex-col w-full group mb-4', className)}>
                {/* Label and Value Display */}
                {(label || showValue) && (
                    <div className="flex items-center justify-between mb-3 px-1">
                        {label && (
                            <label className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] leading-none transition-colors group-focus-within:text-primary">
                                {label}
                            </label>
                        )}
                        {showValue && (
                            <span className="text-primary dark:text-primary text-sm font-bold tabular-nums">
                                {formattedValue}
                            </span>
                        )}
                    </div>
                )}

                {/* Slider */}
                <SliderPrimitive.Root
                    ref={ref}
                    min={min}
                    max={max}
                    step={step}
                    value={internalValue}
                    onValueChange={handleValueChange}
                    disabled={disabled}
                    className={cn(
                        'relative flex items-center select-none touch-none w-full h-6',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    {...props}
                >
                    {/* Track */}
                    <SliderPrimitive.Track
                        className={cn(
                            'relative h-2 w-full grow overflow-hidden rounded-full',
                            'bg-gray-200 dark:bg-gray-800',
                            'transition-colors duration-300'
                        )}
                    >
                        {/* Range (filled portion) */}
                        <SliderPrimitive.Range
                            className={cn(
                                'absolute h-full',
                                'bg-gradient-to-r from-primary to-primary/80',
                                'transition-all duration-300'
                            )}
                        />
                    </SliderPrimitive.Track>

                    {/* Thumb */}
                    <SliderPrimitive.Thumb
                        className={cn(
                            'block h-5 w-5 rounded-full',
                            'bg-white dark:bg-white',
                            'border-2 border-primary',
                            'shadow-lg shadow-primary/20',
                            'transition-all duration-300',
                            'hover:scale-110 hover:shadow-xl hover:shadow-primary/30',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
                            'disabled:pointer-events-none disabled:opacity-50',
                            'cursor-grab active:cursor-grabbing active:scale-95'
                        )}
                    />
                </SliderPrimitive.Root>
            </div>
        );
    }
);

Slider.displayName = 'Slider';
