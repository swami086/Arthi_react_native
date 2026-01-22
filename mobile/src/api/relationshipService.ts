import { supabase } from './supabase';
import { TherapistPatientRelationship } from './types';
import { reportError, withRollbarTrace, startSpan, endSpan } from '../services/rollbar';

export const createRelationship = async (
    therapistId: string,
    patientId: string,
    assignedBy: string,
    practiceId?: string,
    status: 'active' | 'inactive' | 'pending' | 'completed' = 'pending',
    notes?: string
) => {
    startSpan('api.relationship.create');
    try {
        const { data, error } = await supabase
            .from('therapist_patient_relationships')
            .insert({
                therapist_id: therapistId,
                patient_id: patientId,
                status,
                notes,
                assigned_by: assignedBy,
                practice_id: practiceId
            })

            .select()
            .single();

        if (error) {
            reportError(error, 'relationshipService:createRelationship', {
                therapistId,
                patientId,
                status
            });
            throw error;
        }

        return data as TherapistPatientRelationship;
    } catch (error) {
        reportError(error, 'relationshipService:createRelationship', {
            therapistId,
            patientId
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
            .from('therapist_patient_relationships')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', relationshipId)

            .select()
            .single();

        if (error) {
            reportError(error, 'relationshipService:updateRelationshipStatus', { relationshipId, status });
            throw error;
        }
        return data as TherapistPatientRelationship;
    } catch (error) {
        reportError(error, 'relationshipService:updateRelationshipStatus', { relationshipId });
        throw error;
    } finally {
        endSpan();
    }
};

export const getRelationshipsByTherapist = async (therapistId: string, practiceId?: string) => {
    startSpan('api.relationship.getByTherapist');
    try {
        let query = supabase
            .from('therapist_patient_relationships')
            .select('*, patient:profiles!patient_id(*)')
            .eq('therapist_id', therapistId);

        if (practiceId) {
            query = query.eq('practice_id', practiceId);
        }

        const { data, error } = await query;

        if (error) {
            reportError(error, 'relationshipService:getRelationshipsByTherapist', { therapistId });
            throw error;
        }
        return data;
    } catch (error) {
        reportError(error, 'relationshipService:getRelationshipsByTherapist', { therapistId });
        throw error;
    } finally {
        endSpan();
    }
};

export const getRelationshipsByPatient = async (patientId: string) => {
    try {
        const { data, error } = await supabase
            .from('therapist_patient_relationships')
            .select('*, therapist:profiles!therapist_id(*)')
            .eq('patient_id', patientId);

        if (error) throw error;
        return data;
    } catch (error) {
        reportError(error, 'relationshipService:getRelationshipsByPatient');
        throw error;
    }
};

export const checkRelationshipExists = async (therapistId: string, patientId: string) => {
    try {
        const { data, error } = await supabase
            .from('therapist_patient_relationships')
            .select('id')
            .eq('therapist_id', therapistId)
            .eq('patient_id', patientId)
            .eq('status', 'active')
            .maybeSingle();

        if (error) throw error;
        return !!data;
    } catch (error) {
        reportError(error, 'relationshipService:checkRelationshipExists');
        throw error;
    }
};

export const getPendingRelationshipsForPatient = async (patientId: string) => {
    try {
        const { data, error } = await supabase
            .from('therapist_patient_relationships')
            .select(`
            *,
            therapist:profiles!therapist_id(*)
        `)
            .eq('patient_id', patientId)
            .eq('status', 'pending');

        if (error) throw error;
        return data;
    } catch (error) {
        reportError(error, 'relationshipService:getPendingRelationshipsForPatient');
        throw error;
    }
};

export const acceptTherapistRequest = async (relationshipId: string) => {
    try {
        return await updateRelationshipStatus(relationshipId, 'active');
    } catch (error) {
        reportError(error, 'relationshipService:acceptTherapistRequest');
        throw error;
    }
};

export const declineTherapistRequest = async (relationshipId: string) => {
    try {
        const { error } = await supabase
            .from('therapist_patient_relationships')
            .update({
                status: 'declined',
                end_date: new Date().toISOString()
            })
            .eq('id', relationshipId);

        if (error) throw error;
    } catch (error) {
        reportError(error, 'relationshipService:declineTherapistRequest');
        throw error;
    }
};
