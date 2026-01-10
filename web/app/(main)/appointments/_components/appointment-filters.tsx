'use client';

import { motion } from 'framer-motion';

interface AppointmentFiltersProps {
    activeTab: 'upcoming' | 'past';
    displayTimeOfDay?: boolean; // Reusing for time of day filter if needed? Plan implies this file is for the list page.
    // Actually, step 3 says "Segmented control for 'Upcoming' / 'Past History' tabs"
    onTabChange: (tab: 'upcoming' | 'past') => void;
}

export default function AppointmentFilters({ activeTab, onTabChange }: AppointmentFiltersProps) {
    return (
        <div className="bg-muted p-1 rounded-lg flex relative mb-6">
            <button
                onClick={() => onTabChange('upcoming')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors relative z-10 ${activeTab === 'upcoming' ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}
            >
                Upcoming
            </button>
            <button
                onClick={() => onTabChange('past')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors relative z-10 ${activeTab === 'past' ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}
            >
                Past History
            </button>

            <motion.div
                layout
                className="absolute top-1 bottom-1 bg-background shadow-sm rounded-md"
                initial={false}
                animate={{
                    left: activeTab === 'upcoming' ? '4px' : '50%',
                    width: 'calc(50% - 4px)',
                    x: activeTab === 'past' ? '0%' : '0%' // Handled by left/width
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        </div>
    );
}
