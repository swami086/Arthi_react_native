import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../api/supabase';
import { createTherapistNote, updateTherapistNote as apiUpdateNote, deleteTherapistNote as apiDeleteNote } from '../../../api/therapistService';
import { TherapistNote } from '../../../api/types';

export const useTherapistNotes = (patientId: string) => {
    const [notes, setNotes] = useState<TherapistNote[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotes = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('therapist_notes')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotes(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const createNote = async (noteContent: string, isPrivate: boolean, therapistId: string) => {
        try {
            setLoading(true);
            await createTherapistNote({
                patient_id: patientId,
                therapist_id: therapistId,
                note_content: noteContent,
                is_private: isPrivate
            });
            await fetchNotes();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateNote = async (noteId: string, updates: Partial<TherapistNote>) => {
        try {
            setLoading(true);
            await apiUpdateNote(noteId, updates);
            await fetchNotes();
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteNote = async (noteId: string) => {
        try {
            setLoading(true);
            await apiDeleteNote(noteId);
            setNotes(prev => prev.filter(n => n.id !== noteId));
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { notes, loading, error, createNote, updateNote, deleteNote, refetch: fetchNotes };
};
