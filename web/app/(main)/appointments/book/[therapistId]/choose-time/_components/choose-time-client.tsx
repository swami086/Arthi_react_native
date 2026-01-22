'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, Calendar } from 'lucide-react';

import { Button, TimeSlotButton } from '@/components/ui';
import ProgressIndicator from '../../../../_components/progress-indicator';
import { getAvailableTimeSlots } from '@/app/actions/appointments';
import { TimeSlot } from '@/lib/appointments/time-slots';
import { useBookingFlow } from '@/hooks/use-booking-flow';
import { cn } from '@/lib/utils'; // Assuming generic utility
import { addBreadcrumb } from '@/lib/rollbar-utils';

interface ChooseTimeClientProps {
    therapist: any;
    dateStr: string;
    initialTime?: string;
    initialEndTime?: string;
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export default function ChooseTimeClient({
    therapist,
    dateStr,
    initialTime,
    initialEndTime
}: ChooseTimeClientProps) {
    const router = useRouter();
    const { goToConfirmation } = useBookingFlow(therapist.user_id);

    const [allSlots, setAllSlots] = useState<TimeSlot[]>([]);
    const [filteredSlots, setFilteredSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
    const [loading, setLoading] = useState(true);

    const dateObj = new Date(dateStr); // Local interpretation of YYYY-MM-DD string

    useEffect(() => {
        // Fetch all slots
        async function loadSlots() {
            setLoading(true);
            try {
                const result = await getAvailableTimeSlots(therapist.user_id, dateStr);
                if (result.success && result.data) {
                    setAllSlots(result.data);

                    // Pre-select if initialTime provided
                    if (initialTime) {
                        const preselected = result.data.find(s => s.time === initialTime);
                        if (preselected && preselected.available) {
                            setSelectedSlot(preselected);
                            // Determine period of preselected slot to switch tab
                            // Need logic to determine period from time string 'h:mm a'
                            // Simple hack: check against Morning/Afternoon/Evening arrays or re-run generation logic?
                            // Or just loop and check hour?
                            // Actually generateTimeSlots has logic: <12 morning, 12-17 afternoon, >=17 evening
                            // We can guess. 'AM' -> morning (except 12 AM? but slots involve 9am-7pm).
                            // 12 PM - 4:XX PM -> afternoon.
                            // 5 PM+ -> evening.
                            if (preselected.time.includes('AM')) {
                                setTimeOfDay('morning');
                            } else if (preselected.time.includes('PM')) {
                                const hour = parseInt(preselected.time.split(':')[0]);
                                if (hour === 12 || (hour >= 1 && hour < 5)) {
                                    setTimeOfDay('afternoon');
                                } else {
                                    setTimeOfDay('evening');
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        loadSlots();
    }, [therapist.user_id, dateStr, initialTime]);

    useEffect(() => {
        // Filter slots based on timeOfDay
        // Logic duplicated from time-slots.ts potentially, OR we trust the loop logic
        // But here we rely on time strings.
        // Let's implement simple string check or re-parse.

        const filtered = allSlots.filter(slot => {
            const time = slot.time;
            const isAM = time.includes('AM');
            const hour = parseInt(time.split(':')[0]);

            if (timeOfDay === 'morning') {
                // 9 AM - 11:59 AM
                return isAM; // And maybe 12 PM is afternoon
            } else if (timeOfDay === 'afternoon') {
                // 12 PM - 4:59 PM (approx)
                // 12 PM is afternoon. 1, 2, 3, 4 PM.
                return !isAM && (hour === 12 || (hour >= 1 && hour < 5));
            } else {
                // Evening: 5 PM +
                return !isAM && (hour >= 5 && hour !== 12);
            }
        });
        setFilteredSlots(filtered);
    }, [allSlots, timeOfDay]);


    const handleNext = () => {
        if (selectedSlot) {
            addBreadcrumb('Navigating to Step 3', 'booking.choose_time', 'info', {
                therapistId: therapist.user_id,
                date: dateStr,
                time: selectedSlot.time
            });
            goToConfirmation(dateStr, selectedSlot.time, selectedSlot.endTime);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <div className="p-4 border-b">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2 pl-0 hover:bg-transparent">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <h1 className="text-xl font-bold">{format(dateObj, 'EEE, MMM d')}</h1>
            </div>

            <main className="flex-1 p-4 pb-24">
                <ProgressIndicator currentStep={2} />

                <h2 className="text-xl font-bold mb-1 text-center">When works best for you?</h2>
                <div
                    onClick={() => router.back()}
                    className="flex items-center justify-center gap-1 text-sm text-primary cursor-pointer mb-6 hover:underline"
                >
                    <span>Need a different day? View Calendar</span>
                </div>

                {/* Segmented Control */}
                <div className="bg-muted p-1 rounded-lg flex relative mb-6">
                    {(['morning', 'afternoon', 'evening'] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setTimeOfDay(period)}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-md transition-colors relative z-10 capitalize",
                                timeOfDay === period ? "text-primary-foreground" : "text-muted-foreground"
                            )}
                        >
                            {period}
                        </button>
                    ))}
                    <motion.div
                        layout
                        className="absolute top-1 bottom-1 bg-background shadow-sm rounded-md"
                        initial={false}
                        animate={{
                            left: timeOfDay === 'morning' ? '4px' : timeOfDay === 'afternoon' ? '33.33%' : '66.66%', // Approx
                            // Better calculation:
                            x: timeOfDay === 'morning' ? 0 : timeOfDay === 'afternoon' ? '100%' : '200%',
                            width: 'calc(33.33% - 3px)', // roughly
                        }}
                        style={{ left: 2 }} // Base offset
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                </div>

                {/* Slots Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-[80px] rounded-xl bg-muted animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="min-h-[200px]">
                        {filteredSlots.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <p>No slots available for {timeOfDay}.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {filteredSlots.map((slot, idx) => (
                                    <motion.div
                                        key={slot.time}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                    >
                                        <TimeSlotButton
                                            time={slot.time}
                                            isSelected={selectedSlot?.time === slot.time}
                                            onPress={() => setSelectedSlot(slot.available ? slot : null)}
                                            disabled={!slot.available}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-10 flex justify-between gap-4">
                <Button variant="outline" className="flex-1" onClick={() => router.back()}>
                    Back
                </Button>
                <Button
                    className="flex-1"
                    disabled={!selectedSlot}
                    onClick={handleNext}
                >
                    Next Step
                </Button>
            </div>
        </div>
    );
}
