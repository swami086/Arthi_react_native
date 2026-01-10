'use client';

import { useState, useEffect, useTransition } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import ProgressIndicator from '../../../../_components/progress-indicator';
import TimeSlotButton from '../../../../_components/time-slot-button';
import { getAvailableTimeSlots } from '@/app/actions/appointments';
import { TimeSlot } from '@/lib/appointments/time-slots';
import { useBookingFlow } from '@/hooks/use-booking-flow';
import { cn } from '@/lib/utils';
import { addBreadcrumb } from '@/lib/rollbar-utils';

interface SelectDateClientProps {
    therapist: any; // Type strictly if possible
}

export default function SelectDateClient({ therapist }: SelectDateClientProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Use our booking flow hook
    const { goToTimeSelection } = useBookingFlow(therapist.user_id);
    const router = useRouter(); // Backup if needed

    useEffect(() => {
        if (selectedDate) {
            fetchSlots(selectedDate);
            setSelectedTimeSlot(null); // Reset slot on date change
        }
    }, [selectedDate]);

    const fetchSlots = async (date: Date) => {
        setLoadingSlots(true);
        const dateStr = format(date, 'yyyy-MM-dd');

        try {
            const result = await getAvailableTimeSlots(therapist.user_id, dateStr);
            if (result.success && result.data) {
                setAvailableSlots(result.data);
            } else {
                setAvailableSlots([]);
            }
        } catch (error) {
            console.error(error);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleNextStep = () => {
        if (selectedDate) {
            // If a slot is selected, we can pass it, or just pass the date.
            // The plan for Step 2 says "Pre-select time if passed from Step 1".
            // But goToTimeSelection in our hook only took date.
            // Let's manually push with slot if selected.

            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            let url = `/appointments/book/${therapist.user_id}/choose-time?date=${dateStr}`;
            if (selectedTimeSlot) {
                url += `&time=${encodeURIComponent(selectedTimeSlot.time)}&endTime=${encodeURIComponent(selectedTimeSlot.endTime)}`;
            }
            router.push(url);

            addBreadcrumb('Navigating to Step 2', 'booking.select_date', 'info', {
                therapistId: therapist.user_id,
                date: dateStr,
                slot: selectedTimeSlot?.time
            });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <div className="p-4 border-b">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2 pl-0 hover:bg-transparent">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <h1 className="text-xl font-bold">Book Session</h1>
            </div>

            <main className="flex-1 p-4 pb-24">
                <ProgressIndicator currentStep={1} />

                <h2 className="text-lg font-semibold mb-4 text-center">Select a Date</h2>

                <div className="flex justify-center mb-6">
                    <div className="border rounded-xl p-4 bg-card shadow-sm">
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={{ before: new Date() }}
                            classNames={{
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                day_today: "bg-accent text-accent-foreground font-bold",
                            }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {loadingSlots ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-center py-8"
                        >
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <h3 className="font-medium mb-3">Available Slots</h3>
                            {availableSlots.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No slots available for this date.</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    {availableSlots.map((slot, idx) => (
                                        <motion.div
                                            key={`${slot.time}-${idx}`}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <TimeSlotButton
                                                time={slot.time}
                                                isSelected={selectedTimeSlot?.time === slot.time}
                                                onPress={() => setSelectedTimeSlot(slot.available ? slot : null)}
                                                disabled={!slot.available}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-10 flex justify-center">
                <div className="w-full max-w-md">
                    <Button
                        className="w-full"
                        size="lg"
                        disabled={!selectedDate}
                        onClick={handleNextStep}
                    >
                        {selectedTimeSlot ? "Next Step" : "Select Time"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
