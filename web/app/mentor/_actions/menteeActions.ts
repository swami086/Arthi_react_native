'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import rollbar from '@/lib/rollbar';

export async function createNoteAction(formData: { menteeId: string; content: string; isPrivate: boolean }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        const { data, error } = await (supabase.from('mentor_notes') as any).insert({
            mentor_id: user.id,
            mentee_id: formData.menteeId,
            content: formData.content,
            is_private: formData.isPrivate
        })
            .select()
            .single();

        if (error) throw error;

        revalidatePath(`/mentor/mentees/${formData.menteeId}`);
        return { success: true, data };
    } catch (error: any) {
        rollbar.error('Error creating mentor note', error, { user_id: user.id, formData });
        throw new Error(error.message);
    }
}

export async function createGoalAction(formData: { menteeId: string; title: string; progress: number; targetDate?: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        const { data, error } = await (supabase.from('mentee_goals') as any).insert({
            mentor_id: user.id,
            mentee_id: formData.menteeId,
            title: formData.title,
            progress: formData.progress,
            target_date: formData.targetDate
        })
            .select()
            .single();

        if (error) throw error;

        revalidatePath(`/mentor/mentees/${formData.menteeId}`);
        return { success: true, data };
    } catch (error: any) {
        rollbar.error('Error creating mentee goal', error, { user_id: user.id, formData });
        throw new Error(error.message);
    }
}

export async function inviteMenteeAction(menteeId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        // Check if relationship already exists
        const { data: existing } = await (supabase.from('mentor_mentee_relationships') as any)
            .select('id')
            .match({ mentor_id: user.id, mentee_id: menteeId })
            .maybeSingle();

        if (existing) {
            return { success: false, error: 'Invite already sent or connected' };
        }

        const { error } = await (supabase.from('mentor_mentee_relationships') as any).insert({
            mentor_id: user.id,
            mentee_id: menteeId,
            status: 'pending',
            invited_by: 'mentor'
        });

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        rollbar.error('Error inviting mentee', error, { user_id: user.id, menteeId });
        return { success: false, error: error.message };
    }
}
