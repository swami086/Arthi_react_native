'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import rollbar from '@/lib/rollbar';

export async function createNoteAction(formData: { patientId: string; content: string; isPrivate: boolean }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        const { data, error } = await (supabase.from('therapist_notes') as any).insert({
            therapist_id: user.id,
            patient_id: formData.patientId,
            content: formData.content,
            is_private: formData.isPrivate
        })
            .select()
            .single();

        if (error) throw error;

        revalidatePath(`/therapist/patients/${formData.patientId}`);
        return { success: true, data };
    } catch (error: any) {
        rollbar.error('Error creating therapist note', error, { user_id: user.id, formData });
        throw new Error(error.message);
    }
}

export async function createGoalAction(formData: { patientId: string; title: string; progress: number; targetDate?: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        const { data, error } = await (supabase.from('patient_goals') as any).insert({
            therapist_id: user.id,
            patient_id: formData.patientId,
            title: formData.title,
            progress: formData.progress,
            target_date: formData.targetDate
        })
            .select()
            .single();

        if (error) throw error;

        revalidatePath(`/therapist/patients/${formData.patientId}`);
        return { success: true, data };
    } catch (error: any) {
        rollbar.error('Error creating patient goal', error, { user_id: user.id, formData });
        throw new Error(error.message);
    }
}

export async function invitePatientAction(patientId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        // Check if relationship already exists
        const { data: existing } = await (supabase.from('therapist_patient_relationships') as any)
            .select('id')
            .match({ therapist_id: user.id, patient_id: patientId })
            .maybeSingle();

        if (existing) {
            return { success: false, error: 'Invite already sent or connected' };
        }

        const { error } = await (supabase.from('therapist_patient_relationships') as any).insert({
            therapist_id: user.id,
            patient_id: patientId,
            status: 'pending',
            invited_by: 'therapist'
        });

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        rollbar.error('Error inviting patient', error, { user_id: user.id, patientId });
        return { success: false, error: error.message };
    }
}
