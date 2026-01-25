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
        // Fetch payments without joins to avoid PostgREST relationship issues
        const { data: payments, error: paymentsError } = await (supabase.from('payments') as any)
            .select('id, created_at, amount, currency, status, patient_id')
            .eq('therapist_id', therapistId)
            .order('created_at', { ascending: false });

        if (paymentsError) throw paymentsError;

        // Collect unique patient IDs
        const patientIds = Array.from(
            new Set(
                (payments || [])
                    .map((p: any) => p.patient_id)
                    .filter((id: string | null) => !!id)
            )
        );

        // Fetch patient names in a separate query
        let patientMap = new Map<string, string>();
        if (patientIds.length > 0) {
            const { data: patients, error: patientsError } = await supabase
                .from('profiles')
                .select('user_id, full_name')
                .in('user_id', patientIds as string[]);

            if (patientsError) throw patientsError;

            patientMap = new Map(
                (patients || []).map((p: any) => [p.user_id as string, p.full_name as string])
            );
        }

        const headers = ['Date', 'ID', 'Patient', 'Amount', 'Currency', 'Status'];
        const rows = (payments || []).map((p: any) => [
            new Date(p.created_at).toLocaleDateString(),
            p.id,
            patientMap.get(p.patient_id) || 'N/A',
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
