'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GradientAvatarProps {
    src: string;
    alt: string;
    size?: number;
    online?: boolean;
    className?: string;
}

export const GradientAvatar: React.FC<GradientAvatarProps> = ({
    src,
    alt,
    size = 80,
    online = false,
    className,
}) => {
    return (
        <div
            className={cn('relative inline-block', className)}
            style={{ width: size, height: size }}
        >
            <div
                className="w-full h-full rounded-full p-[2px] bg-gradient-to-br from-[#30bae8] to-[#9055ff]"
            >
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 p-[2px] flex items-center justify-center overflow-hidden">
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            className="object-cover"
                            sizes={`${size}px`}
                        />
                    </div>
                </div>
            </div>

            {online && (
                <motion.div
                    animate={{
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute bottom-0 right-0 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"
                    style={{
                        width: Math.max(size * 0.25, 12),
                        height: Math.max(size * 0.25, 12),
                    }}
                />
            )}
        </div>
    );
};
