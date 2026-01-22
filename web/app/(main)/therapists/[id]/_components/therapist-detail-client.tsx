
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GradientAvatar } from '@/components/ui/gradient-avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Assuming this exists or use standard div
import { Star, Briefcase, GraduationCap, Clock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
    therapist: any;
    reviews: any[];
    availability: any[];
}

export default function TherapistDetailClient({ therapist, reviews, availability }: Props) {
    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <GradientAvatar
                    src={therapist.avatar_url}
                    alt={therapist.full_name}
                    size={120}
                />
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-bold">{therapist.full_name}</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">{therapist.specialization}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-900 dark:text-gray-100">{therapist.rating_average || 'New'}</span>
                        <span>({reviews.length} reviews)</span>
                    </div>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                    <Button
                        onClick={() => router.push(`/appointments/book/${therapist.user_id}/select-date`)}
                        className="font-bold"
                    >
                        Book Session
                    </Button>
                    <Button
                        onClick={() => router.push(`/appointments?smart_book=true&therapistId=${therapist.user_id}`)}
                        variant="outline"
                        className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
                    >
                        <Sparkles className="w-4 h-4" /> Smart Book
                    </Button>
                    <Button variant="ghost">Message</Button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">About</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{therapist.bio}</p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Expertise</h2>
                    <div className="flex flex-wrap gap-2">
                        {therapist.expertise_areas?.map((area: string) => (
                            <span key={area} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                                {area}
                            </span>
                        )) || <p className="text-gray-500">No expertise listed</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
