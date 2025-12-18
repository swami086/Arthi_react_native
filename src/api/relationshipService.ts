import { supabase } from './supabase';
import { MentorMenteeRelationship } from './types';

export const createRelationship = async (mentorId: string, menteeId: string, assignedBy: string, status: 'active' | 'inactive' | 'pending' | 'completed' = 'pending', notes?: string) => {
    const { data, error } = await supabase
        .from('mentor_mentee_relationships')
        .insert({
            mentor_id: mentorId,
            mentee_id: menteeId,
            assigned_by: assignedBy,
            notes,
            status
        })
        .select()
        .single();

    if (error) throw error;
    return data as MentorMenteeRelationship;
};

export const updateRelationshipStatus = async (relationshipId: string, status: 'active' | 'inactive' | 'pending' | 'completed') => {
    const { data, error } = await supabase
        .from('mentor_mentee_relationships')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', relationshipId)
        .select()
        .single();

    if (error) throw error;
    return data as MentorMenteeRelationship;
};

export const getRelationshipsByMentor = async (mentorId: string) => {
    const { data, error } = await supabase
        .from('mentor_mentee_relationships')
        .select('*, mentee:profiles!mentee_id(*)')
        .eq('mentor_id', mentorId);

    if (error) throw error;
    return data;
};

export const getRelationshipsByMentee = async (menteeId: string) => {
    const { data, error } = await supabase
        .from('mentor_mentee_relationships')
        .select('*, mentor:profiles!mentor_id(*)')
        .eq('mentee_id', menteeId);

    if (error) throw error;
    return data;
};

export const checkRelationshipExists = async (mentorId: string, menteeId: string) => {
    const { data, error } = await supabase
        .from('mentor_mentee_relationships')
        .select('id')
        .eq('mentor_id', mentorId)
        .eq('mentee_id', menteeId)
        .eq('status', 'active')
        .maybeSingle();

    if (error) throw error;
    return !!data;
};

export const getPendingRelationshipsForMentee = async (menteeId: string) => {
    const { data, error } = await supabase
        .from('mentor_mentee_relationships')
        .select(`
            *,
            mentor:profiles!mentor_id(*)
        `)
        .eq('mentee_id', menteeId)
        .eq('status', 'pending');

    if (error) throw error;
    return data;
};

export const acceptMentorRequest = async (relationshipId: string) => {
    return updateRelationshipStatus(relationshipId, 'active');
};

export const declineMentorRequest = async (relationshipId: string) => {
    const { error } = await supabase
        .from('mentor_mentee_relationships')
        .update({
            status: 'declined',
            end_date: new Date().toISOString()
        })
        .eq('id', relationshipId);

    if (error) throw error;
};
