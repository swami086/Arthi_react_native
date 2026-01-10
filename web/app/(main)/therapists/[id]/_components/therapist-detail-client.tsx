'use client';

import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, MessageCircle, Calendar } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { GradientAvatar } from '@/components/ui/gradient-avatar';
import { RatingStars } from '@/components/ui/rating-stars';
import { TagPill } from '@/components/ui/tag-pill';
import { BottomActionBar } from '@/components/ui/bottom-action-bar';
import { Database } from '@/types/database';

import { staggerContainer, scaleIn } from '@/lib/animation-variants';
import { addBreadcrumb, reportInfo } from '@/lib/rollbar-utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface TherapistDetailClientProps {
    therapist: Profile;
    reviews: any[];
    availability: any[];
}

export default function TherapistDetailClient({ therapist, reviews, availability }: TherapistDetailClientProps) {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);
    const [showFullBio, setShowFullBio] = useState(false);

    // For specific animations if needed, or stick to simple variants
    const { scrollY } = useScroll();
    const headerScale = useTransform(scrollY, [0, 200], [1, 0.9]);
    const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);

    const handleFavorite = () => {
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
        addBreadcrumb('Therapist favorite toggled', 'therapist.favorite', 'info', { therapistId: therapist.user_id, isFavorite: !isFavorite });
    };

    const handleMessage = () => {
        addBreadcrumb('Navigate to message', 'therapist.message', 'info', { therapistId: therapist.user_id });
        router.push(`/messages?userId=${therapist.user_id}`);
    };

    const handleBookSession = () => {
        addBreadcrumb('Navigate to book session', 'therapist.book', 'info', { therapistId: therapist.user_id });
        router.push(`/appointments/book?therapistId=${therapist.user_id}`);
        // In a real app, might pass intent via state or robust query params
    };

    const nextSlot = availability?.[0]?.start_time ? new Date(availability[0].start_time) : null;

    const expertiseColors: ('blue' | 'purple' | 'orange' | 'green' | 'gray')[] = ['blue', 'purple', 'green', 'orange'];

    return (
        <div className="pb-32"> {/* Padding for bottom action bar */}
            {/* Header */}
            <motion.header
                style={{ scale: headerScale, opacity: headerOpacity }}
                className="relative z-10 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md pt-6 pb-4 px-6 md:px-0 max-w-4xl mx-auto -mx-6 md:mx-auto"
            >
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 md:left-0 p-2 rounded-full bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-white/10 transition-colors"
                    aria-label="Go back"
                >
                    <ArrowLeft size={24} className="text-gray-900 dark:text-gray-100" />
                </button>
            </motion.header>

            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="max-w-4xl mx-auto px-6 space-y-10"
            >
                {/* Profile Brief */}
                <motion.section variants={scaleIn} className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left mt-[-20px] md:mt-0">
                    <div className="relative">
                        <GradientAvatar
                            src={therapist.avatar_url || ''}
                            alt={therapist.full_name || 'Therapist'}
                            size={120}
                            className="shadow-2xl shadow-primary/20"
                        />
                        <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white dark:border-background-dark rounded-full" />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                    {therapist.specialization || 'Therapist'}
                                </span>
                                <button
                                    onClick={handleFavorite}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Heart size={20} className={cn("stroke-[2.5px]", isFavorite && "fill-red-500 text-red-500")} />
                                </button>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white">
                                {therapist.full_name}
                            </h1>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-10 border-t border-b border-gray-100 dark:border-gray-800 py-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1 justify-center md:justify-start">
                                    <span className="text-xl font-black text-gray-900 dark:text-gray-100">
                                        {therapist.rating_average?.toFixed(1) || '5.0'}
                                    </span>
                                    <RatingStars rating={therapist.rating_average || 5} size={14} />
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Rating
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xl font-black text-gray-900 dark:text-gray-100">
                                    {therapist.years_of_experience || 1}+ Years
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Experience
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xl font-black text-gray-900 dark:text-gray-100">
                                    ${therapist.hourly_rate || 0}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Hourly Rate
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* About */}
                <motion.section variants={scaleIn} className="space-y-4">
                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">About</h3>
                    <div className="relative">
                        <p className={cn(
                            "text-gray-600 dark:text-gray-300 leading-relaxed text-base font-medium",
                            !showFullBio && "line-clamp-4"
                        )}>
                            {therapist.bio || "No bio available."}
                        </p>
                        {therapist.bio && therapist.bio.length > 200 && (
                            <button
                                onClick={() => setShowFullBio(!showFullBio)}
                                className="mt-2 text-primary font-bold text-xs uppercase tracking-wider hover:underline"
                            >
                                {showFullBio ? 'Read Less' : 'Read More'}
                            </button>
                        )}
                    </div>
                </motion.section>

                {/* Expertise */}
                <motion.section variants={scaleIn} className="space-y-4">
                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">Expertise</h3>
                    <div className="flex flex-wrap gap-3">
                        {therapist.expertise_areas?.map((area: string, i: number) => (
                            <TagPill
                                key={i}
                                label={area}
                                color={expertiseColors[i % expertiseColors.length]}
                            />
                        ))}
                    </div>
                </motion.section>

                {/* Availability Preview */}
                <motion.section variants={scaleIn} className="space-y-4">
                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">Availability</h3>
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-primary/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-gray-100">Next Available Slot</p>
                                <p className="text-sm text-primary font-medium">
                                    {nextSlot ? nextSlot.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Check calendar'}
                                </p>
                            </div>
                        </div>
                        <Button onClick={handleBookSession} size="sm" className="w-full sm:w-auto">
                            See Calendar
                        </Button>
                    </div>
                </motion.section>

                {/* Reviews */}
                <motion.section variants={scaleIn} className="space-y-4">
                    <div className="flex justify-between items-end">
                        <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">Reviews</h3>
                        <Button variant="link" size="sm" className="text-gray-400 hover:text-primary h-auto p-0">See All</Button>
                    </div>

                    {reviews.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
                            {reviews.map((review: any) => (
                                <div key={review.id} className="min-w-[280px] md:min-w-[320px] bg-white dark:bg-[#1a2c32] p-5 rounded-3xl border border-gray-100 dark:border-border-dark flex flex-col gap-3 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <GradientAvatar
                                                src={review.patient?.avatar_url || ''}
                                                alt={review.patient?.full_name || 'Anonymous'}
                                                size={32}
                                            />
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
                                                {review.patient?.full_name || 'Anonymous'}
                                            </span>
                                        </div>
                                        <RatingStars rating={review.rating} size={12} />
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed line-clamp-3">
                                        "{review.comment}"
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-auto">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No reviews yet.</p>
                        </div>
                    )}
                </motion.section>
            </motion.div>

            <BottomActionBar
                primaryLabel="Book Session"
                onPrimaryClick={handleBookSession}
                secondaryLabel="Message"
                onSecondaryClick={handleMessage}
            />
        </div>
    );
}
