'use client';

import { useState } from 'react';
import { format, isSameDay, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import AppointmentCard from './appointment-card';
import AppointmentFilters from './appointment-filters';
import { updateAppointmentStatus } from '@/app/actions/appointments';
import { Button } from '@/components/ui/button';

interface AppointmentsListClientProps {
    initialAppointments: any[];
}

export default function AppointmentsListClient({ initialAppointments }: AppointmentsListClientProps) {
    const router = useRouter();
    const [appointments, setAppointments] = useState(initialAppointments || []);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    // Filter appointments
    const now = new Date();

    const upcoming = appointments.filter(appt => {
        const end = new Date(appt.end_time);
        return isAfter(end, now) && appt.status !== 'cancelled';
    });

    const past = appointments.filter(appt => {
        const end = new Date(appt.end_time);
        return isBefore(end, now) && appt.status !== 'cancelled'; // Or show cancelled in history? Plan says "Past History"
    });

    // Also include cancelled in past if we want
    // But usually history implies completed.
    // Let's stick to valid ones for now or follow typical pattern.

    const displayedAppointments = activeTab === 'upcoming' ? upcoming : past;

    // Grouping logic for upcoming
    const groupedUpcoming: { [key: string]: any[] } = {};
    if (activeTab === 'upcoming') {
        displayedAppointments.forEach(appt => {
            const start = new Date(appt.start_time);
            let key = format(start, 'yyyy-MM-dd');

            if (isSameDay(start, now)) key = 'Today';
            else if (isSameDay(start, addDays(now, 1))) key = 'Tomorrow';
            else key = format(start, 'EEE, MMM d');

            if (!groupedUpcoming[key]) groupedUpcoming[key] = [];
            groupedUpcoming[key].push(appt);
        });
    }

    const handleCancel = async (appointmentId: string) => {
        // Optimistic update
        const original = [...appointments];
        setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' } : a)); // Or remove?

        toast.promise(updateAppointmentStatus(appointmentId, 'cancelled'), {
            loading: 'Cancelling...',
            success: () => {
                router.refresh();
                return 'Session cancelled';
            },
            error: () => {
                setAppointments(original); // Revert
                return 'Failed to cancel session';
            }
        });
    };

    const handleJoin = (appointmentId: string) => {
        router.push(`/video/${appointmentId}/waiting`);
    };

    return (
        <div className="min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Session Management</h1>
                {/* Optional: Add session button */}
            </div>

            <AppointmentFilters activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'upcoming' ? (
                <div className="space-y-6">
                    {Object.keys(groupedUpcoming).length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No upcoming sessions.</p>
                            <Button className="mt-4" onClick={() => router.push('/mentors')}>Find a Mentor</Button>
                        </div>
                    ) : (
                        Object.entries(groupedUpcoming).map(([group, appts]) => (
                            <div key={group}>
                                <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{group}</h2>
                                {appts.map(appt => (
                                    <AppointmentCard
                                        key={appt.id}
                                        appointment={appt}
                                        variant="upcoming"
                                        onCancel={() => handleCancel(appt.id)}
                                        onJoin={() => handleJoin(appt.id)}
                                    />
                                ))}
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {past.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No past sessions.</p>
                        </div>
                    ) : (
                        past.map(appt => (
                            <AppointmentCard
                                key={appt.id}
                                appointment={appt}
                                variant="past"
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
