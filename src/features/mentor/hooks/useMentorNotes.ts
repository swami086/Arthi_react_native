import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../api/supabase';
import { createMentorNote, updateMentorNote as apiUpdateNote, deleteMentorNote as apiDeleteNote } from '../../../api/mentorService';
import { MentorNote } from '../../../api/types';

export const useMentorNotes = (menteeId: string) => {
    const [notes, setNotes] = useState<MentorNote[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotes = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('mentor_notes')
                .select('*')
                .eq('mentee_id', menteeId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotes(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [menteeId]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const createNote = async (noteContent: string, isPrivate: boolean, mentorId: string) => {
        try {
            setLoading(true);
            await createMentorNote({
                mentee_id: menteeId,
                mentor_id: mentorId,
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

    const updateNote = async (noteId: string, updates: Partial<MentorNote>) => {
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
