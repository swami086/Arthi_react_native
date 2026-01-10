import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../api/supabase';
import { createPatientGoal, updatePatientGoal as apiUpdateGoal } from '../../../api/mentorService';
import { PatientGoal } from '../../../api/types';

export const usePatientGoals = (menteeId: string) => {
    const [goals, setGoals] = useState<PatientGoal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGoals = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('mentee_goals')
                .select('*')
                .eq('mentee_id', menteeId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGoals(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [menteeId]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const createGoal = async (goal: Omit<PatientGoal, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            setLoading(true);
            await createPatientGoal(goal);
            await fetchGoals();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateGoal = async (goalId: string, updates: Partial<PatientGoal>) => {
        try {
            setLoading(true);
            await apiUpdateGoal(goalId, updates);
            await fetchGoals();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // deleteGoal helper if needed... not explicitly in service but easy to add.
    const deleteGoal = async (goalId: string) => {
        try {
            setLoading(true);
            const { error } = await supabase.from('mentee_goals').delete().eq('id', goalId);
            if (error) throw error;
            setGoals(prev => prev.filter(g => g.id !== goalId));
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { goals, loading, error, createGoal, updateGoal, deleteGoal, refetch: fetchGoals };
};
