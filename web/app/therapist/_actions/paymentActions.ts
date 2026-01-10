'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import rollbar from '@/lib/rollbar';

/**
 * Revalidate payment data cache
 */
export async function refreshEarningsDataAction() {
    try {
        revalidatePath('/therapist/payments');
        return { success: true };
    } catch (error: any) {
        rollbar.error('Error refreshing earnings data', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate export data for payment history
 */
export async function exportPaymentHistoryAction(therapistId: string) {
    const supabase = await createClient();
    try {
        const { data, error } = await (supabase.from('payments') as any)
            .select(`
                id,
                created_at,
                amount,
                currency,
                status,
                patient: profiles!payments_patient_id_fkey(full_name)
            `)
            .eq('therapist_id', therapistId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const headers = ['Date', 'ID', 'Patient', 'Amount', 'Currency', 'Status'];
        const rows = (data || []).map((p: any) => [
            new Date(p.created_at).toLocaleDateString(),
            p.id,
            p.patient?.full_name || 'N/A',
            p.amount,
            p.currency,
            p.status
        ]);

        return { success: true, csvData: [headers, ...rows] };
    } catch (error: any) {
        rollbar.error('Error exporting payment history', error, { therapistId });
        return { success: false, error: error.message };
    }
}
