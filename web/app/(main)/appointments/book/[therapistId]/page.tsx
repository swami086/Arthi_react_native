import { redirect } from 'next/navigation';

interface Props {
    params: {
        therapistId: string;
    };
}

export default function TherapistBookingPage({ params }: Props) {
    // Redirect to the first step of the manual booking flow
    redirect(`/appointments/book/${params.therapistId}/select-date`);
}
