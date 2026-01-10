'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ChevronLeft, Calendar, Clock, Video, Lock, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { GradientAvatar } from '@/components/ui/gradient-avatar';
import { TagPill } from '@/components/ui/tag-pill';
import ProgressIndicator from '../../../../_components/progress-indicator';
import { useBookingFlow } from '@/hooks/use-booking-flow';
// import { Input } from '@/components/ui/input'; // Textarea better
import { cn } from '@/lib/utils';

interface ConfirmClientProps {
    mentor: any;
    dateStr: string;
    time: string;
    endTime: string;
}

export default function ConfirmAppointmentClient({
    mentor,
    dateStr,
    time,
    endTime
}: ConfirmClientProps) {
    const router = useRouter();
    const { confirmBooking, isPending } = useBookingFlow(mentor.user_id);
    const [notes, setNotes] = useState('');

    const formattedDate = format(new Date(dateStr), 'EEEE, MMMM d, yyyy');
    const price = mentor.hourly_rate || 0;
    const isFree = price === 0;

    const handleConfirm = () => {
        confirmBooking({
            date: dateStr,
            time,
            endTime,
            price,
            notes
        }, (appointmentId) => {
            if (!isFree) {
                router.push(`/payment/checkout?appointmentId=${appointmentId}`);
            } else {
                router.push('/appointments');
            }
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="p-4 border-b">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2 pl-0 hover:bg-transparent">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <h1 className="text-xl font-bold">Review Booking</h1>
            </div>

            <main className="flex-1 p-4 space-y-6">
                <ProgressIndicator currentStep={3} />

                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">Review session details</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        You're almost there! Please check that everything looks right.
                    </p>
                </div>

                {/* Mentor Card */}
                <div className="bg-card border rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <GradientAvatar src={mentor.avatar_url} alt={mentor.full_name} size={64} />
                        <div>
                            <h3 className="font-semibold">{mentor.full_name}</h3>
                            <TagPill label={mentor.specialization || 'Mentor'} color="blue" />
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/appointments/book/${mentor.user_id}/select-date`)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </div>

                {/* Appointment Info */}
                <div className="bg-card border rounded-xl p-4 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Appointment Info</h3>
                        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => router.back()}>
                            Edit
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Date</p>
                                <p className="font-medium">{formattedDate}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Time</p>
                                <p className="font-medium">{time} - {endTime} (IST)</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Video className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Format</p>
                                <p className="font-medium">Video Call via Google Meet</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 border-t">
                        <div className={cn(
                            "py-2 px-3 rounded-lg text-center font-medium text-sm",
                            isFree ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted"
                        )}>
                            {isFree ? "Free Introductory Session" : `Paid Session: ₹${price}`}
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Notes for Mentor (Optional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes or topics you'd like to discuss..."
                        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
            </main>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-10 flex flex-col gap-3">
                <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>Confidential, safe & secure space</span>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => router.back()}>
                        Back
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={handleConfirm}
                        disabled={isPending}
                    >
                        {isPending ? "Confirming..." : isFree ? "Confirm Booking" : "Proceed to Payment"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
