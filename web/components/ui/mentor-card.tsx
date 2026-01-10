'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { GradientAvatar } from './gradient-avatar';
import { TagPill } from './tag-pill';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MentorCardProps {
    name: string;
    role: string;
    imageUrl?: string;
    rating?: number;
    bio: string;
    expertise: string[];
    isOnline?: boolean;
    onClick: () => void;
    className?: string;
}

export const MentorCard: React.FC<MentorCardProps> = ({
    name,
    role,
    imageUrl,
    rating = 4.8,
    bio,
    expertise,
    isOnline = false,
    onClick,
    className,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'group bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5',
                className
            )}
            onClick={onClick}
        >
            <div className="flex-shrink-0 flex justify-center items-start">
                <GradientAvatar
                    src={imageUrl || 'https://via.placeholder.com/150'}
                    alt={name}
                    size={100}
                    online={isOnline}
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="min-w-0">
                        <span className="text-primary font-black text-[10px] uppercase tracking-[0.1em] mb-1 block">
                            {role || 'Mentor'}
                        </span>
                        <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-1 truncate leading-tight group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                    </div>

                    <div className="flex-shrink-0 bg-yellow-400/10 dark:bg-yellow-400/5 px-2.5 py-1 rounded-xl flex items-center border border-yellow-400/20">
                        <Star size={14} className="text-yellow-500 fill-yellow-500 mr-1.5" />
                        <span className="text-xs font-black text-gray-800 dark:text-yellow-400">{rating}</span>
                    </div>
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                    {bio || 'No bio available.'}
                </p>

                <div className="flex flex-wrap gap-2">
                    {expertise.slice(0, 3).map((tag, index) => (
                        <TagPill
                            key={index}
                            label={tag}
                            color={index % 2 === 0 ? 'blue' : 'purple'}
                            delay={index * 0.1}
                        />
                    ))}
                    {expertise.length > 3 && (
                        <TagPill
                            label={`+${expertise.length - 3}`}
                            color="gray"
                            delay={0.3}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
};
