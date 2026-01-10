'use client';

import { useState } from 'react';
import { createGoalAction } from '../_actions/menteeActions';
import { toast } from 'sonner';

export function useMenteeGoals(menteeId: string) {
    const [loading, setLoading] = useState(false);

    const createGoal = async (title: string, progress: number, targetDate?: string) => {
        try {
            setLoading(true);
            const result = await createGoalAction({ menteeId, title, progress, targetDate });
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
