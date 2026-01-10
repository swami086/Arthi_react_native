'use server';

import { createClient } from '@/lib/supabase/server';
import { reportError, addBreadcrumb } from '@/lib/rollbar-utils';
import { revalidatePath } from 'next/cache';

export async function getPendingMentorRequests(menteeId: string) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('mentor_mentee_relationships')
            .select(`
                *,
                mentor:profiles!mentor_mentee_relationships_mentor_id_fkey(*)
            `)
            .eq('mentee_id', menteeId)
            .eq('status', 'pending');

        if (error) throw error;
        return data || [];
    } catch (error) {
        reportError(error, 'relationships.getPendingRequests', { menteeId });
        return [];
    }
}

export async function acceptMentorRequest(relationshipId: string) {
    const supabase = await createClient();

    try {
        addBreadcrumb('Accepting mentor request', 'relationships.accept', 'info', { relationshipId });

        const { error } = await (supabase.from('mentor_mentee_relationships') as any)
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

export async function declineMentorRequest(relationshipId: string) {
    const supabase = await createClient();

    try {
        addBreadcrumb('Declining mentor request', 'relationships.decline', 'info', { relationshipId });

        const { error } = await (supabase.from('mentor_mentee_relationships') as any)
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
