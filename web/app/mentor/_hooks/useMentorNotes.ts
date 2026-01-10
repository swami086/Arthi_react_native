'use client';

import { useState } from 'react';
import { createNoteAction } from '../_actions/patientActions';
import { toast } from 'sonner';

export function useTherapistNotes(patientId: string) {
    const [loading, setLoading] = useState(false);

    const createNote = async (content: string, isPrivate: boolean) => {
        try {
            setLoading(true);
            const result = await createNoteAction({ patientId, content, isPrivate });
            toast.success('Note added');
            return result.data;
        } catch (error: any) {
            toast.error(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { createNote, loading };
}
