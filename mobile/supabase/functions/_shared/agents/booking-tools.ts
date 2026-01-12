import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { zodToJsonSchema } from 'npm:zod-to-json-schema@3.21.4';

const checkAvailabilitySchema = z.object({
    therapistId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const createAppointmentSchema = z.object({
    patientId: z.string().uuid(),
    therapistId: z.string().uuid(),
    startTime: z.string().datetime(),
    duration: z.number().min(30).max(120),
    notes: z.string().optional(),
});

const sendConfirmationSchema = z.object({
    appointmentId: z.string().uuid(),
    channels: z.array(z.enum(['whatsapp', 'email', 'push'])),
});

const suggestAlternativesSchema = z.object({
    therapistId: z.string().uuid(),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    flexibilityDays: z.number().min(1).max(14).default(7),
});

export const bookingTools = [
    {
        type: 'function',
        function: {
            name: 'check_therapist_availability',
            description: 'Check available time slots for a therapist on a specific date',
            parameters: zodToJsonSchema(checkAvailabilitySchema),
        }
    },
    {
        type: 'function',
        function: {
            name: 'create_appointment',
            description: 'Create a new appointment booking',
            parameters: zodToJsonSchema(createAppointmentSchema),
        }
    },
    {
        type: 'function',
        function: {
            name: 'send_booking_confirmation',
            description: 'Send confirmation via WhatsApp and email',
            parameters: zodToJsonSchema(sendConfirmationSchema),
        }
    },
    {
        type: 'function',
        function: {
            name: 'suggest_alternative_slots',
            description: 'Suggest alternative time slots if preferred slot is unavailable',
            parameters: zodToJsonSchema(suggestAlternativesSchema),
        }
    },
];

export async function executeBookingTool(
    toolName: string,
    args: any,
    supabase: any
): Promise<any> {
    switch (toolName) {
        case 'check_therapist_availability':
            return await checkAvailability(supabase, args.therapistId, args.date);

        case 'create_appointment':
            return await createAppointment(supabase, args);

        case 'send_booking_confirmation':
            return await sendConfirmation(supabase, args.appointmentId, args.channels);

        case 'suggest_alternative_slots':
            return await suggestAlternatives(supabase, args);

        default:
            throw new Error(`Unknown tool: ${toolName}`);
    }
}

async function checkAvailability(supabase: any, therapistId: string, date: string) {
    // Query existing appointments
    const { data: appointments } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('therapist_id', therapistId)
        .gte('start_time', `${date}T00:00:00Z`)
        .lt('start_time', `${date}T23:59:59Z`)
        .eq('status', 'confirmed');

    // Generate available slots (9 AM - 6 PM, 1-hour slots)
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
        const slotTime = `${date}T${hour.toString().padStart(2, '0')}:00:00Z`;
        const isBooked = appointments?.some(apt => apt.start_time === slotTime);
        if (!isBooked) {
            slots.push({ time: slotTime, available: true });
        }
    }

    return { date, therapistId, availableSlots: slots, count: slots.length };
}

async function createAppointment(supabase: any, args: any) {
    const startTime = new Date(args.startTime);
    const endTime = new Date(startTime.getTime() + args.duration * 60000);

    // Conflict check
    const { data: conflicts, error: checkError } = await supabase
        .from('appointments')
        .select('id')
        .eq('therapist_id', args.therapistId)
        .in('status', ['pending', 'confirmed'])
        .lt('start_time', endTime.toISOString())
        .gt('end_time', startTime.toISOString());

    if (checkError) throw checkError;

    if (conflicts && conflicts.length > 0) {
        return {
            success: false,
            error: 'Time slot conflict detected. The therapist is already booked for this window.',
            conflictCount: conflicts.length
        };
    }

    const { data, error } = await supabase
        .from('appointments')
        .insert({
            patient_id: args.patientId,
            therapist_id: args.therapistId,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: 'confirmed',
            notes: args.notes,
        })
        .select()
        .single();

    if (error) throw error;
    return { success: true, appointment: data };
}

async function sendConfirmation(supabase: any, appointmentId: string, channels: string[]) {
    // Fetch appointment details
    const { data: appointment, error } = await supabase
        .from('appointments')
        .select('*, patient:profiles!patient_id(*), therapist:profiles!therapist_id(*)')
        .eq('id', appointmentId)
        .single();

    if (error) throw error;

    const results = [];

    for (const channel of channels) {
        if (channel === 'whatsapp') {
            // Call existing WhatsApp function
            try {
                await supabase.functions.invoke('send-whatsapp-message', {
                    body: {
                        to: appointment.patient.phone_number,
                        message: 'Appointment confirmed with ' + appointment.therapist.full_name + ' on ' + appointment.start_time,
                    },
                });
                results.push({ channel: 'whatsapp', sent: true });
            } catch (err) {
                results.push({ channel: 'whatsapp', sent: false, error: err.message });
            }
        }
        // Add email, push notification handlers
    }

    return { appointmentId, confirmationsSent: results };
}

async function suggestAlternatives(supabase: any, args: any) {
    const alternatives = [];
    const startDate = new Date(args.preferredDate);

    for (let i = 0; i < args.flexibilityDays; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(checkDate.getDate() + i);
        const dateStr = checkDate.toISOString().split('T')[0];

        const availability = await checkAvailability(supabase, args.therapistId, dateStr);
        if (availability.count > 0) {
            alternatives.push({
                date: dateStr,
                slots: availability.availableSlots.slice(0, 3), // Top 3 slots
            });
        }
    }

    return { alternatives, count: alternatives.length };
}
