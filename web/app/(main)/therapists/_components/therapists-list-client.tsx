
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GradientAvatar } from '@/components/ui/gradient-avatar';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    initialTherapists: any[];
}

export default function TherapistsListClient({ initialTherapists }: Props) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTherapists = initialTherapists.filter(t =>
        t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search therapists by name or specialty..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" /> Filters
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTherapists.map((therapist) => (
                    <motion.div
                        key={therapist.user_id}
                        layoutId={therapist.user_id}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => router.push(`/therapists/${therapist.user_id}`)}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <GradientAvatar src={therapist.avatar_url} alt={therapist.full_name} size={64} />
                            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                {therapist.years_of_experience || '1+'} Years Exp
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                            {therapist.full_name}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">{therapist.specialization}</p>

                        <div className="flex flex-wrap gap-1.5 mb-6">
                            {therapist.expertise_areas?.slice(0, 3).map((area: string) => (
                                <span key={area} className="text-[10px] font-bold px-2 py-1 bg-gray-50 dark:bg-gray-900 rounded-md text-gray-600 dark:text-gray-400">
                                    {area}
                                </span>
                            ))}
                            {(therapist.expertise_areas?.length || 0) > 3 && (
                                <span className="text-[10px] font-bold px-2 py-1 bg-gray-50 dark:bg-gray-900 rounded-md text-gray-400">
                                    +{therapist.expertise_areas.length - 3}
                                </span>
                            )}
                        </div>

                        <Button className="w-full">View Profile</Button>
                    </motion.div>
                ))}
            </div>

            {filteredTherapists.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No therapists found matching your search.
                </div>
            )}
        </div>
    );
}
