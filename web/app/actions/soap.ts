'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { SoapNote } from '@/types/soap-note';

// Generate SOAP Note
export async function generateSoapNote(appointmentId: string, transcriptId: string) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.functions.invoke('generate-soap-note', {
            body: { appointment_id: appointmentId, transcript_id: transcriptId },
        });

        if (error) throw error;

        revalidatePath(`/mentor/sessions/${appointmentId}/soap`);
        return { success: true, data };
    } catch (error: any) {
        console.error('Error generating SOAP note:', error);
        return { success: false, error: error.message };
    }
}

// Regenerate SOAP Note
export async function regenerateSoapNote(appointmentId: string, transcriptId: string) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.functions.invoke('generate-soap-note', {
            body: { appointment_id: appointmentId, transcript_id: transcriptId, regenerate: true },
        });

        if (error) throw error;

        revalidatePath(`/mentor/sessions/${appointmentId}/soap`);
        return { success: true, data };
    } catch (error: any) {
        console.error('Error regenerating SOAP note:', error);
        return { success: false, error: error.message };
    }
}

// Update SOAP Note Section
export async function updateSoapNote(
    id: string,
    appointmentId: string,
    updates: Partial<SoapNote>
) {
    const supabase = await createClient();

    try {
        // Use any cast to bypass strict typing issues with generated Database types
        const { error } = await (supabase.from('soap_notes') as any)
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
                edited_by_mentor: true
            })
            .eq('id', id);

        if (error) throw error;

        revalidatePath(`/mentor/sessions/${appointmentId}/soap`);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating SOAP note:', error);
        return { success: false, error: error.message };
    }
}

// Finalize SOAP Note
export async function finalizeSoapNote(id: string, appointmentId: string) {
    const supabase = await createClient();

    try {
        const { error } = await (supabase.from('soap_notes') as any)
            .update({
                is_finalized: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        revalidatePath(`/mentor/sessions/${appointmentId}/soap`);
        return { success: true };
    } catch (error: any) {
        console.error('Error finalizing SOAP note:', error);
        return { success: false, error: error.message };
    }
}

// Regenerate Section (Placeholder)
export async function regenerateSection(
    section: string,
    appointmentId: string,
    currentContent: string,
    instructions: string
) {
    return { success: false, error: "Feature not implemented yet" };
}
