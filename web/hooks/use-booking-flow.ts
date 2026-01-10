'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createAppointment } from '@/app/actions/appointments';
import { toast } from 'sonner';

export function useBookingFlow(therapistId: string) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const goToTimeSelection = (date: Date) => {
        const dateStr = date.toISOString(); // Or YYYY-MM-DD
        // Using YYYY-MM-DD ensures we stick to the selected calendar date
        // date-fns format(date, 'yyyy-MM-dd') is better but we need the import.
        // We'll rely on simple ISO split or local format.
        // Let's use simple local ISO date part extraction if we want local date.
        // Or better, pass the full ISO and handle it.
        // Just formatting to YYYY-MM-DD.
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        router.push(`/appointments/book/${therapistId}/choose-time?date=${formattedDate}`);
    };

    const goToConfirmation = (date: string, time: string, endTime: string) => {
        const params = new URLSearchParams({
            date,
            time,
            endTime
        });
        router.push(`/appointments/book/${therapistId}/confirm?${params.toString()}`);
    };

    const confirmBooking = async (
        data: { date: string; time: string; endTime: string; price: number; notes?: string },
        onSuccess?: (appointmentId: string) => void
    ) => {
        startTransition(async () => {
            const result = await createAppointment({
                therapistId,
                ...data
            });

            if (result.success && result.data?.appointmentId) {
                toast.success('Appointment booked successfully!');
                if (onSuccess) onSuccess(result.data.appointmentId);
                // Default nav if no callback?
                // Plan says: "If paid: navigate to checkout... If free: navigate to /appointments"
            } else {
                toast.error(result.error || 'Failed to book appointment');
            }
        });
    };

    return {
        isPending,
        goToTimeSelection,
        goToConfirmation,
        confirmBooking
    };
}
