import { addMinutes, format, setHours, setMinutes, isBefore } from 'date-fns';

export interface TimeSlot {
    time: string;
    endTime: string;
    available: boolean;
}

export const generateTimeSlots = (
    date: Date,
    timeOfDay?: 'morning' | 'afternoon' | 'evening'
): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 19; // 7 PM
    const slotDuration = 45; // minutes
    const interval = 60; // 1 hour intervals

    // Create a start time for the given date
    // Note: We need to handle timezone correctly in real app, but using local time for now
    let currentTime = setMinutes(setHours(date, startHour), 0);
    const endTime = setMinutes(setHours(date, endHour), 0);

    while (isBefore(currentTime, endTime)) {
        const slotEnd = addMinutes(currentTime, slotDuration);
        const timeString = format(currentTime, 'h:mm a');
        const endTimeString = format(slotEnd, 'h:mm a');

        const hour = currentTime.getHours();
        let period = 'morning';
        if (hour >= 12 && hour < 17) period = 'afternoon';
        if (hour >= 17) period = 'evening';

        if (!timeOfDay || timeOfDay === period) {
            slots.push({
                time: timeString,
                endTime: endTimeString,
                available: true // Default to true, filter later
            });
        }

        currentTime = addMinutes(currentTime, interval);
    }

    return slots;
};

export const filterAvailableSlots = (
    mentorId: string,
    date: string,
    allSlots: TimeSlot[],
    existingAppointments: { start_time: string; end_time: string }[]
): TimeSlot[] => {
    return allSlots.map(slot => {
        // Parse slot start and end times to compare
        // slot.time is "h:mm a" (e.g. "2:00 PM")
        // We need to combine it with the date to get a comparable timestamp
        // However, since we are just checking availability, we can parse the times relative to the date

        // Helper to parse "h:mm a" to minutes from midnight for easier comparison if needed, 
        // OR better: construct full Date objects

        const slotStart = new Date(`${date} ${slot.time}`);
        const slotEnd = new Date(`${date} ${slot.endTime}`); // Note: endTime format in TimeSlot matches time format? "h:mm a"

        // Wait, standard Date parsing of "YYYY-MM-DD h:mm a" might vary by environment. 
        // Safer to use a dedicated parser if available or rely on the fact that we generated these slots using date-fns
        // But since we are inside the util that generated them, we can assume format consistency.
        // Let's rely on string comparison of ISOs if we had them, OR use the passed 'date' and slot strings.

        // Let's iterate existingAppointments and check for overlap
        const isBooked = existingAppointments.some(appt => {
            const apptStart = new Date(appt.start_time);
            const apptEnd = new Date(appt.end_time);

            // Textual parsing of slot time for comparison
            // We'll use the same base date context
            const currentSlotStart = new Date(Date.parse(`${date} ${slot.time}`));
            const currentSlotEnd = new Date(Date.parse(`${date} ${slot.endTime}`));

            // Check overlap: (StartA < EndB) and (EndA > StartB)
            return currentSlotStart < apptEnd && currentSlotEnd > apptStart;
        });

        return {
            ...slot,
            available: !isBooked
        };
    });
};

export const formatTimeSlot = (time: string): string => {
    return time;
};
