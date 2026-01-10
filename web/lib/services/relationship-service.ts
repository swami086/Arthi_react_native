import { SupabaseClient } from '@supabase/supabase-js';
import { reportError } from '@/lib/rollbar-utils';

export async function getReferrals(supabase: SupabaseClient, userId: string, role: 'therapist' | 'referrer' = 'therapist') {
    try {
        let query = supabase.from('referrals').select(`
            *,
            referred:recipient_id(full_name),
            referrer:referrer_id(full_name),
            patient:patient_id(full_name)
        `);

        if (role === 'therapist') {
            query = query.eq('recipient_id', userId);
        } else {
            query = query.eq('referrer_id', userId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    } catch (error) {
        reportError(error, 'relationship_service.getReferrals');
        return [];
    }
}

export async function respondToReferral(supabase: SupabaseClient, referralId: string, status: 'accepted' | 'declined') {
    try {
        const { error } = await supabase
            .from('referrals')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', referralId);

        if (error) throw error;
        return true;
    } catch (error) {
        reportError(error, 'relationship_service.respondToReferral');
        return false;
    }
}
