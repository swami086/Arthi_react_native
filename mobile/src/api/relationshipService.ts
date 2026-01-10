import { supabase } from './supabase';
import { MentorMenteeRelationship } from './types';
import { reportError, withRollbarTrace, startSpan, endSpan } from '../services/rollbar';

export const createRelationship = async (
    mentorId: string,
    menteeId: string,
    assignedBy: string,
    status: 'active' | 'inactive' | 'pending' | 'completed' = 'pending',
    notes?: string
) => {
    startSpan('api.relationship.create');
    try {
        const { data, error } = await supabase
            .from('mentor_mentee_relationships')
            .insert({
                mentor_id: mentorId,
                mentee_id: menteeId,
                status,
                notes,
                assigned_by: assignedBy
            })

            .select()
            .single();

        if (error) {
            reportError(error, 'relationshipService:createRelationship', {
                mentorId,
                menteeId,
                status
            });
            throw error;
        }

        return data as MentorMenteeRelationship;
    } catch (error) {
        reportError(error, 'relationshipService:createRelationship', {
            mentorId,
            menteeId
        });
        throw error;
    } finally {
        endSpan();
    }
};

export const updateRelationshipStatus = async (relationshipId: string, status: 'active' | 'inactive' | 'pending' | 'completed') => {
    startSpan('api.relationship.updateStatus');
    try {
        const { data, error } = await supabase
            .from('mentor_mentee_relationships')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', relationshipId)

            .select()
            .single();

        if (error) {
            reportError(error, 'relationshipService:updateRelationshipStatus', { relationshipId, status });
            throw error;
        }
        return data as MentorMenteeRelationship;
    } catch (error) {
        reportError(error, 'relationshipService:updateRelationshipStatus', { relationshipId });
        throw error;
    } finally {
        endSpan();
    }
};

export const getRelationshipsByMentor = async (mentorId: string) => {
    startSpan('api.relationship.getByMentor');
    try {
        const { data, error } = await supabase
            .from('mentor_mentee_relationships')
            .select('*, mentee:profiles!mentee_id(*)')
            .eq('mentor_id', mentorId)
            ;

        if (error) {
            reportError(error, 'relationshipService:getRelationshipsByMentor', { mentorId });
            throw error;
        }
        return data;
    } catch (error) {
        reportError(error, 'relationshipService:getRelationshipsByMentor', { mentorId });
        throw error;
    } finally {
        endSpan();
    }
};

export const getRelationshipsByMentee = async (menteeId: string) => {
    try {
        const { data, error } = await supabase
            .from('mentor_mentee_relationships')
            .select('*, mentor:profiles!mentor_id(*)')
            .eq('mentee_id', menteeId);

        if (error) throw error;
        return data;
    } catch (error) {
        reportError(error, 'relationshipService:getRelationshipsByMentee');
        throw error;
    }
};

export const checkRelationshipExists = async (mentorId: string, menteeId: string) => {
    try {
        const { data, error } = await supabase
            .from('mentor_mentee_relationships')
            .select('id')
            .eq('mentor_id', mentorId)
            .eq('mentee_id', menteeId)
            .eq('status', 'active')
            .maybeSingle();

        if (error) throw error;
        return !!data;
    } catch (error) {
        reportError(error, 'relationshipService:checkRelationshipExists');
        throw error;
    }
};

export const getPendingRelationshipsForMentee = async (menteeId: string) => {
    try {
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
    } catch (error) {
        reportError(error, 'relationshipService:getPendingRelationshipsForMentee');
        throw error;
    }
};

export const acceptMentorRequest = async (relationshipId: string) => {
    try {
        return await updateRelationshipStatus(relationshipId, 'active');
    } catch (error) {
        reportError(error, 'relationshipService:acceptMentorRequest');
        throw error;
    }
};

export const declineMentorRequest = async (relationshipId: string) => {
    try {
        const { error } = await supabase
            .from('mentor_mentee_relationships')
            .update({
                status: 'declined',
                end_date: new Date().toISOString()
            })
            .eq('id', relationshipId);

        if (error) throw error;
    } catch (error) {
        reportError(error, 'relationshipService:declineMentorRequest');
        throw error;
    }
};
