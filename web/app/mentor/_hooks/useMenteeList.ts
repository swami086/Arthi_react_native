
import { createClient } from '@/lib/supabase/client';
import { useState, useCallback, useEffect } from 'react';
import { reportError } from '@/lib/rollbar-utils';
import { toast } from 'sonner';

export interface Mentee {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
    status: 'active' | 'pending' | 'completed';
    created_at: string;
    // Add other fields from RPC/query
}

export function useMenteeList() {
    const supabase = createClient();
    const [mentees, setMentees] = useState<Mentee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMentees = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Using relationship table or RPC
            const { data, error } = await (supabase
                .from('mentor_mentee_relationships') as any)
                .select(`
                    id,
                    status,
                    created_at,
                    mentee:mentee_id(id, full_name, avatar_url, email)
                `)
                .eq('mentor_id', user.id)
                .eq('status', 'active'); // Filtering for active list

            if (error) throw error;

            // Transform data
            const formatted: Mentee[] = data.map((item: any) => ({
                id: item.mentee.id,
                full_name: item.mentee.full_name,
                avatar_url: item.mentee.avatar_url,
                email: item.mentee.email,
                status: item.status,
                created_at: item.created_at
            }));

            setMentees(formatted);

        } catch (err: any) {
            console.error('Error fetching mentees:', err);
            setError(err.message);
            reportError(err, 'useMenteeList');
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const removeMentee = async (menteeId: string) => {
        try {
            // Optimistic update
            setMentees(prev => prev.filter(m => m.id !== menteeId));

            // Call API/Server Action
            // Doing client-side delete for now as per simple plan, or usually invoke a server action
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await (supabase
                .from('mentor_mentee_relationships') as any)
                .update({ status: 'inactive' } as any) // Soft delete
                .eq('mentor_id', user.id)
                .eq('mentee_id', menteeId);

            if (error) throw error;
            toast.success('Mentee removed successfully');
        } catch (err: any) {
            toast.error('Failed to remove mentee');
            reportError(err, 'removeMentee');
            fetchMentees(); // Revert on error
        }
    };

    useEffect(() => {
        fetchMentees();
        // Subscribe to changes
        // Subscribe to changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchMentees();
        });

        // Realtime
        const channel = supabase.channel('mentee-list-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'mentor_mentee_relationships' }, () => {
                fetchMentees();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, [fetchMentees, supabase]);

    return { mentees, loading, error, refetch: fetchMentees, removeMentee };
}
