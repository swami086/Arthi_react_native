'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, StarHalf } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface RatingStarsProps {
    rating: number;
    maxRating?: number;
    onRatingChange?: (rating: number) => void;
    size?: number;
    readonly?: boolean;
    className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    maxRating = 5,
    onRatingChange,
    size = 24,
    readonly = false,
    className,
}) => {
    return (
        <div className={cn('flex items-center gap-1', className)}>
            {Array.from({ length: maxRating }).map((_, index) => {
                const starIndex = index + 1;
                const filled = starIndex <= Math.floor(rating);
                const isHalf = !filled && starIndex <= Math.ceil(rating) && (rating % 1 !== 0);

                return (
                    <motion.button
                        key={index}
                        type="button"
                        disabled={readonly}
                        whileHover={readonly ? {} : { scale: 1.2, rotate: 5 }}
                        whileTap={readonly ? {} : { scale: 0.9 }}
                        onClick={() => onRatingChange && onRatingChange(starIndex)}
                        className={cn(
                            'focus:outline-none transition-colors group',
                            readonly ? 'cursor-default' : 'cursor-pointer'
                        )}
                    >
                        {isHalf ? (
                            <StarHalf
                                size={size}
                                className="text-yellow-400 fill-yellow-400"
                            />
                        ) : (
                            <Star
                                size={size}
                                className={cn(
                                    'transition-all duration-300',
                                    filled
                                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm'
                                        : 'text-gray-200 dark:text-gray-700'
                                )}
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
};
