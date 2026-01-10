'use server';

import { createClient } from '@/lib/supabase/server';
import { reportError, addBreadcrumb } from '@/lib/rollbar-utils';
import { revalidatePath } from 'next/cache';

export async function getPendingTherapistRequests(patientId: string) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('therapist_patient_relationships')
            .select(`
                *,
                therapist:profiles!therapist_patient_relationships_therapist_id_fkey(*)
            `)
            .eq('patient_id', patientId)
            .eq('status', 'pending');

        if (error) throw error;
        return data || [];
    } catch (error) {
        reportError(error, 'relationships.getPendingRequests', { patientId });
        return [];
    }
}

export async function acceptTherapistRequest(relationshipId: string) {
    const supabase = await createClient();

    try {
        addBreadcrumb('Accepting therapist request', 'relationships.accept', 'info', { relationshipId });

        const { error } = await (supabase.from('therapist_patient_relationships') as any)
            .update({
                status: 'active',
                updated_at: new Date().toISOString()
            } as any)
            .eq('id', relationshipId);

        if (error) throw error;

        revalidatePath('/home');
        return { success: true };
    } catch (error) {
        reportError(error, 'relationships.acceptRequest', { relationshipId });
        return { success: false, error: 'Failed to accept request' };
    }
}

export async function declineTherapistRequest(relationshipId: string) {
    const supabase = await createClient();

    try {
        addBreadcrumb('Declining therapist request', 'relationships.decline', 'info', { relationshipId });

        const { error } = await (supabase.from('therapist_patient_relationships') as any)
            .update({
                status: 'declined',
                updated_at: new Date().toISOString()
            } as any)
            .eq('id', relationshipId);

        if (error) throw error;

        revalidatePath('/home');
        return { success: true };
    } catch (error) {
        reportError(error, 'relationships.declineRequest', { relationshipId });
        return { success: false, error: 'Failed to decline request' };
    }
}
