'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MentorCard } from '@/components/ui/mentor-card';
import { Input } from '@/components/ui/input';
import { FilterChip } from '@/components/ui/filter-chip';
import { Button } from '@/components/ui/button';
import { Database } from '@/types/database';
import { applyMentorFilters } from '@/lib/utils/mentor-filters';
import { staggerContainer, scaleIn } from '@/lib/animation-variants';
import { addBreadcrumb } from '@/lib/rollbar-utils';
import Image from 'next/image';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useMediaQuery } from '@/hooks/use-media-query';

type Profile = Database['public']['Tables']['profiles']['Row'];

const FILTERS = ['All Filters', 'Anxiety', 'Depression', 'Career', 'Relationships', 'School Stress', 'Self-Esteem', 'Trauma'];

interface MentorsListClientProps {
    initialMentors: Profile[];
}

export default function MentorsListClient({ initialMentors }: MentorsListClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const [selectedFilter, setSelectedFilter] = useState('All Filters');
    const [sortBy, setSortBy] = useState<'rating' | 'experience'>('rating');

    const filteredMentors = useMemo(() => {
        return applyMentorFilters(initialMentors, {
            query: searchQuery,
            expertise: selectedFilter === 'All Filters' ? null : selectedFilter,
            sortBy
        });
    }, [initialMentors, searchQuery, selectedFilter, sortBy]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (e.target.value.length > 2) {
            addBreadcrumb('Mentor search', 'mentors.search', 'info', { query: e.target.value });
        }
    };

    const handleFilterSelect = (filter: string) => {
        setSelectedFilter(filter);
        addBreadcrumb('Mentor filter selected', 'mentors.filter', 'info', { filter });
    };

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-2">
                        Find Your Mentor
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Connect with verified experts for personalized guidance and support.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <div className="relative">
                            <Input
                                placeholder="Search by name, expertise, or bio..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-12 h-14 rounded-2xl bg-white dark:bg-[#1a2c32] border-gray-100 dark:border-border-dark shadow-sm text-base"
                            />
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
                        <div className="flex gap-2">
                            {FILTERS.map((filter) => (
                                <FilterChip
                                    key={filter}
                                    label={filter}
                                    isSelected={selectedFilter === filter}
                                    onClick={() => handleFilterSelect(filter)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                        Showing <span className="text-gray-900 dark:text-gray-100">{filteredMentors.length}</span> mentors
                    </p>

                    {/* Sort Dropdown Placeholder - Simplified as a toggle for now */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSortBy(prev => prev === 'rating' ? 'experience' : 'rating')}
                        leftIcon={<ArrowUpDown size={14} />}
                        className="text-gray-500"
                    >
                        Sort by {sortBy === 'rating' ? 'Rating' : 'Experience'}
                    </Button>
                </div>
            </div>

            {/* Content */}
            {/* Content */}
            {filteredMentors.length > 0 ? (
                <VirtualizedMentorsGrid mentors={filteredMentors} />
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="w-48 h-48 relative mb-6 opacity-80">
                        {/* Placeholder illustration or generic icon */}
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <Search size={64} className="text-gray-300 dark:text-gray-600" />
                        </div>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">No mentors found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                        Try adjusting your search or filters to find what you're looking for.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedFilter('All Filters');
                        }}
                        className="mt-6"
                    >
                        Clear Filters
                    </Button>
                </motion.div>
            )}
        </div>
    );
}

function VirtualizedMentorsGrid({ mentors }: { mentors: Profile[] }) {
    const router = useRouter();
    const isMd = useMediaQuery('(min-width: 768px)');
    const isLg = useMediaQuery('(min-width: 1024px)');
    const columns = isLg ? 3 : isMd ? 2 : 1;

    const rows = Math.ceil(mentors.length / columns);

    const rowVirtualizer = useWindowVirtualizer({
        count: rows,
        estimateSize: () => 480, // Card height + gap
        overscan: 5,
    });

    return (
        <div
            style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
            }}
        >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const startIndex = virtualRow.index * columns;
                const rowMentors = mentors.slice(startIndex, startIndex + columns);

                return (
                    <div
                        key={virtualRow.index}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1" // px-1 to avoid outline clipping
                    >
                        {rowMentors.map((mentor) => (
                            <div key={mentor.user_id} className="h-full pb-6"> {/* pb-6 simulates gap-y */}
                                <MentorCard
                                    name={mentor.full_name || 'Unknown Mentor'}
                                    role={mentor.specialization || 'Mentor'}
                                    imageUrl={mentor.avatar_url || undefined}
                                    rating={parseFloat((mentor.rating_average || 0).toFixed(1))}
                                    bio={mentor.bio || ''}
                                    expertise={mentor.expertise_areas || []}
                                    onClick={() => router.push(`/mentors/${mentor.user_id}`)}
                                    className="h-full"
                                />
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
