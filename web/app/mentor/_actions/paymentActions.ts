'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import rollbar from '@/lib/rollbar';

/**
 * Revalidate payment data cache
 */
export async function refreshEarningsDataAction() {
    try {
        revalidatePath('/mentor/payments');
        return { success: true };
    } catch (error: any) {
        rollbar.error('Error refreshing earnings data', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate export data for payment history
 */
export async function exportPaymentHistoryAction(mentorId: string) {
    const supabase = await createClient();
    try {
        const { data, error } = await (supabase.from('payments') as any)
            .select(`
                id,
                created_at,
                amount,
                currency,
                status,
                mentee: profiles!payments_mentee_id_fkey(full_name)
            `)
            .eq('mentor_id', mentorId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const headers = ['Date', 'ID', 'Mentee', 'Amount', 'Currency', 'Status'];
        const rows = (data || []).map((p: any) => [
            new Date(p.created_at).toLocaleDateString(),
            p.id,
            p.mentee?.full_name || 'N/A',
            p.amount,
            p.currency,
            p.status
        ]);

        return { success: true, csvData: [headers, ...rows] };
    } catch (error: any) {
        rollbar.error('Error exporting payment history', error, { mentorId });
        return { success: false, error: error.message };
    }
}
