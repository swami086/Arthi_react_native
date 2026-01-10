import { addMinutes, format, setHours, setMinutes, isBefore, parse } from 'date-fns';

export interface TimeSlot {
    time: string;
    endTime: string;
    available: boolean;
}

/**
 * Generates 45-minute time slots between 9 AM and 7 PM.
 * @param date The date to generate slots for
 * @param timeOfDay Optional filter ('morning', 'afternoon', 'evening')
 */
export const generateTimeSlots = (
    date: Date,
    timeOfDay?: 'morning' | 'afternoon' | 'evening'
): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 19; // 7 PM
    const slotDuration = 45; // minutes
    const interval = 60; // 1 hour intervals

    // Use noon to avoid DST/timezone issues when setting hours on a specific date object
    // passed in, effectively keeping the "date" part stable.
    // However, we must ensure we work with the correct local representation logic.
    // For generation, we just want strings like "9:00 AM".
    // We can use a reference date.

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
    dateStr: string, // YYYY-MM-DD
    allSlots: TimeSlot[],
    existingAppointments: { start_time: string; end_time: string }[]
): TimeSlot[] => {
    return allSlots.map(slot => {
        // Construct comparable dates using strict parsing
        const parseDateTime = (d: string, t: string) => {
            return parse(`${d} ${t} `, 'yyyy-MM-dd h:mm a', new Date());
        };

        const slotStart = parseDateTime(dateStr, slot.time);
        const slotEnd = parseDateTime(dateStr, slot.endTime);

        const isBooked = existingAppointments.some(appt => {
            const apptStart = new Date(appt.start_time);
            const apptEnd = new Date(appt.end_time);

            // Simple overlap check
            return slotStart < apptEnd && slotEnd > apptStart;
        });

        return {
            ...slot,
            available: !isBooked
        };
    });
};
