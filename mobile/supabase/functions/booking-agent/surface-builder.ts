/**
 * A2UI Surface Builder for Booking Agent
 * Generates structured component definitions for the booking flow.
 */

export function buildTherapistSelectionSurface(therapists: any[]) {
    return [
        {
            id: 'therapist-selection-card',
            type: 'Card',
            props: { className: 'border-none shadow-none bg-transparent' },
            children: [
                {
                    id: 'therapist-selection-header',
                    type: 'CardHeader',
                    props: { className: 'px-0' },
                    children: [
                        { id: 'therapist-selection-title', type: 'CardTitle', props: { children: 'Select your therapist' } },
                        { id: 'therapist-selection-desc', type: 'CardDescription', props: { children: 'Find the right specialist for your specific needs and goals.' } }
                    ]
                },
                {
                    id: 'therapist-grid',
                    type: 'CardContent',
                    props: { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 px-0' },
                    children: therapists.map((t, idx) => ({
                        id: `therapist-card-${t.user_id || idx}`,
                        type: 'TherapistCard',
                        props: {
                            name: t.full_name,
                            role: t.specialization || 'Mental Health Professional',
                            imageUrl: t.avatar_url || 'https://via.placeholder.com/150',
                            rating: 4.9,
                            bio: t.therapist_bio_extended || 'Experienced therapist dedicated to your mental well-being.',
                            expertise: ['CBT', 'Anxiety', 'Work-Life Balance'],
                            isOnline: true,
                            onClick: 'select_therapist'
                        },
                        actionPayload: { therapistId: t.user_id }
                    }))
                }
            ]
        }
    ];
}

export function buildDateTimeSurface(therapist: any, selectedDate: string, availableSlots: any[]) {
    const isoDate = new Date(selectedDate).toISOString();

    return [
        {
            id: 'datetime-selection-card',
            type: 'Card',
            props: { className: 'border-none shadow-none bg-transparent' },
            children: [
                {
                    id: 'datetime-header',
                    type: 'CardHeader',
                    props: { className: 'px-0' },
                    children: [
                        { id: 'datetime-title', type: 'CardTitle', props: { children: `Session with ${therapist.full_name}` } },
                        { id: 'datetime-desc', type: 'CardDescription', props: { children: 'Please select a date and an available time slot.' } }
                    ]
                },
                {
                    id: 'datetime-content',
                    type: 'CardContent',
                    props: { className: 'space-y-8 px-0' },
                    children: [
                        {
                            id: 'calendar-picker',
                            type: 'CalendarPicker',
                            props: {
                                selectedDate: isoDate,
                                onDateSelect: 'select_date',
                                availableDates: [isoDate]
                            },
                            actionPayload: { therapistId: therapist.user_id }
                        },
                        {
                            id: 'time-slots-container',
                            type: 'Card',
                            props: { className: 'bg-gray-50/50 dark:bg-slate-900/20 border-none p-4' },
                            children: [
                                {
                                    id: 'time-slots-content',
                                    type: 'CardContent',
                                    props: { className: 'grid grid-cols-2 sm:grid-cols-3 gap-3 p-0' },
                                    children: availableSlots.map((slot, idx) => ({
                                        id: `time-slot-${idx}`,
                                        type: 'TimeSlotButton',
                                        props: {
                                            time: slot.time,
                                            endTime: slot.endTime,
                                            available: slot.available,
                                            isSelected: false,
                                            onPress: 'select_time_slot'
                                        },
                                        actionPayload: {
                                            therapistId: therapist.user_id,
                                            date: selectedDate,
                                            time: slot.time,
                                            endTime: slot.endTime
                                        }
                                    }))
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];
}

export function buildConfirmationSurface(therapist: any, slot: any) {
    const isoStart = new Date(`${slot.date} ${slot.time}`).toISOString();
    const isoEnd = new Date(`${slot.date} ${slot.endTime}`).toISOString();

    return [
        {
            id: 'confirmation-card',
            type: 'Card',
            props: { className: 'border-none shadow-none bg-transparent' },
            children: [
                {
                    id: 'confirmation-header',
                    type: 'CardHeader',
                    props: { className: 'px-0' },
                    children: [
                        { id: 'confirmation-title', type: 'CardTitle', props: { children: 'Review and Confirm' } },
                        { id: 'confirmation-desc', type: 'CardDescription', props: { children: 'Check your appointment details before finalizing.' } }
                    ]
                },
                {
                    id: 'confirmation-content',
                    type: 'CardContent',
                    props: { className: 'px-0' },
                    children: [
                        {
                            id: 'appointment-preview',
                            type: 'AppointmentCard',
                            props: {
                                appointment: {
                                    therapist: {
                                        full_name: therapist.full_name,
                                        avatar_url: therapist.avatar_url,
                                        specialization: therapist.specialization
                                    },
                                    start_time: isoStart,
                                    end_time: isoEnd,
                                    status: 'pending'
                                },
                                variant: 'upcoming',
                                onConfirm: 'confirm_booking',
                                onCancel: 'cancel_booking'
                            },
                            actionPayload: {
                                therapistId: therapist.user_id,
                                date: slot.date,
                                time: slot.time,
                                endTime: slot.endTime
                            }
                        }
                    ]
                }
            ]
        }
    ];
}

export function buildSuccessSurface(appointment: any) {
    return [
        {
            id: 'success-card',
            type: 'Card',
            props: { className: 'border-green-500/20 bg-green-500/5 shadow-2xl shadow-green-500/10' },
            children: [
                {
                    id: 'success-header',
                    type: 'CardHeader',
                    props: {},
                    children: [
                        { id: 'success-title', type: 'CardTitle', props: { children: 'Reservation Successful!' } },
                        { id: 'success-desc', type: 'CardDescription', props: { children: 'Your therapeutic session has been confirmed and added to your schedule.' } }
                    ]
                },
                {
                    id: 'success-content',
                    type: 'CardContent',
                    props: {},
                    children: [
                        {
                            id: 'success-appointment-card',
                            type: 'AppointmentCard',
                            props: {
                                appointment: {
                                    therapist: appointment.therapist,
                                    start_time: appointment.start_time,
                                    end_time: appointment.end_time,
                                    status: 'confirmed',
                                    meeting_link: appointment.meeting_link
                                },
                                variant: 'upcoming',
                                onJoin: 'view_appointments'
                            }
                        }
                    ]
                }
            ]
        }
    ];
}
