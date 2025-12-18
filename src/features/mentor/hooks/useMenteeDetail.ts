import { useEffect, useState, useCallback } from 'react';
import { getMenteeProfile } from '../../../api/mentorService';
import { Profile, MenteeGoal, MentorNote } from '../../../api/types';
import { supabase } from '../../../api/supabase';

export const useMenteeDetail = (menteeId: string) => {
    const [mentee, setMentee] = useState<Profile | null>(null);
    const [goals, setGoals] = useState<MenteeGoal[]>([]);
    const [notes, setNotes] = useState<MentorNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getMenteeProfile(menteeId);
            if (data) {
                setMentee(data.profile);
                setGoals(data.goals);
                setNotes(data.notes);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [menteeId]);

    useEffect(() => {
        fetchDetail();

        const sub = supabase.channel(`mentee_detail_${menteeId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'mentor_notes', filter: `mentee_id=eq.${menteeId}` }, fetchDetail)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'mentee_goals', filter: `mentee_id=eq.${menteeId}` }, fetchDetail)
            .subscribe();

        return () => { sub.unsubscribe(); };

    }, [fetchDetail, menteeId]);

    return { mentee, goals, notes, loading, error, refetch: fetchDetail };
};
