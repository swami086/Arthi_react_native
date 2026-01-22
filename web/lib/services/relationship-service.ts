import { SupabaseClient } from '@supabase/supabase-js';
import { reportError } from '@/lib/rollbar-utils';

export async function getReferrals(supabase: SupabaseClient, userId: string, role: 'therapist' | 'referrer' = 'therapist', practiceId?: string) {
    try {
        let query = supabase.from('patient_referrals').select(`
            *,
            referred_to:profiles!mentee_referrals_referred_to_mentor_id_fkey(user_id, full_name, avatar_url),
            referrer:profiles!mentee_referrals_referring_mentor_id_fkey(user_id, full_name, avatar_url),
            patient:profiles!mentee_referrals_mentee_id_fkey(user_id, full_name, avatar_url)
        `);

        if (role === 'therapist') {
            query = query.eq('referred_to_therapist_id', userId);
        } else {
            query = query.eq('referring_therapist_id', userId);
        }

        if (practiceId) {
            query = query.eq('practice_id', practiceId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    } catch (error) {
        reportError(error, 'relationship_service.getReferrals');
        return [];
    }
}

export async function respondToReferral(supabase: SupabaseClient, referralId: string, status: 'accepted' | 'declined', practiceId?: string) {
    try {
        let query = supabase
            .from('patient_referrals')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', referralId);

        if (practiceId) {
            query = query.eq('practice_id', practiceId);
        }

        const { error } = await query;

        if (error) throw error;
        return true;
    } catch (error) {
        reportError(error, 'relationship_service.respondToReferral');
        return false;
    }
}
