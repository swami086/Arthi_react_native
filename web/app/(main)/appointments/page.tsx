import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getAppointments } from '@/app/actions/appointments';
import AppointmentsListClient from './_components/appointments-list-client';
import { Metadata } from 'next';
import { addBreadcrumb } from '@/lib/rollbar-utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'My Sessions | SafeSpace',
    description: 'Manage your counseling sessions.',
};

export default async function AppointmentsPage() {
    const supabase = await createClient();
    addBreadcrumb('Loading appointments page', 'appointments.page', 'info');

    // getAppointments handles auth check internal or we do it here?
    // It does handle it.
    const result = await getAppointments();

    const appointments = result.success && result.data ? result.data : [];

    return (
        <div className="container max-w-md mx-auto py-6 px-4">
            <Suspense fallback={<div className="p-4 text-center">Loading sessions...</div>}>
                <AppointmentsListClient initialAppointments={appointments} />
            </Suspense>
        </div>
    );
}
