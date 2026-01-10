'use client';

import { useState } from 'react';
import { createGoalAction } from '../_actions/patientActions';
import { toast } from 'sonner';

export function usePatientGoals(patientId: string) {
    const [loading, setLoading] = useState(false);

    const createGoal = async (title: string, progress: number, targetDate?: string) => {
        try {
            setLoading(true);
            const result = await createGoalAction({ patientId, title, progress, targetDate });
            toast.success('Goal added');
            return result.data;
        } catch (error: any) {
            toast.error(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { createGoal, loading };
}
