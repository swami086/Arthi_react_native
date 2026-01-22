import { supabase } from './supabase';
import { PatientGoal, TherapistNote, TherapistStats, PatientWithActivity, Appointment } from './types';
import { generateDailyMeetLink } from '../utils/meetingLink';
import { reportError, withRollbarTrace, startSpan, endSpan, startTimer, endTimer, withRollbarSpan, getTraceId } from '../services/rollbar';

export const getTherapistStats = async (therapistId: string, practiceId?: string): Promise<TherapistStats | null> => {
    startSpan('api.therapist.getTherapistStats');
    startTimer('therapist_stats_fetch');
    try {
        const { data, error } = await supabase
            // @ts-ignore
            .rpc('get_therapist_stats', {
                therapist_user_id: therapistId
            });

        if (error) {
            reportError(error, 'therapistService:getTherapistStats', { therapistId });
            return null;
        }

        endTimer('therapist_stats_fetch', 'therapistService:getTherapistStats', { therapistId });
        return data as TherapistStats;
    } catch (error) {
        reportError(error, 'therapistService:getTherapistStats', { therapistId });
        return null;
    } finally {
        endSpan();
    }
};

export const getPatientList = async (therapistId: string): Promise<PatientWithActivity[]> => {
    startSpan('api.therapist.getPatientList');
    startTimer('patient_list_fetch');
    try {
        const { data, error } = await supabase
            // @ts-ignore
            .rpc('get_patient_list_for_therapist', { therapist_user_id: therapistId });

        if (error) {
            reportError(error, 'therapistService:getPatientList', { therapistId });
            return [];
        }

        endTimer('patient_list_fetch', 'therapistService:getPatientList', {
            therapistId,
            patientCount: data?.length || 0
        });
        return data as PatientWithActivity[];
    } catch (error) {
        reportError(error, 'therapistService:getPatientList', { therapistId });
        return [];
    } finally {
        endSpan();
    }
};

export const getPatientProfile = async (patientId: string) => {
    startSpan('api.therapist.getPatientProfile');
    try {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', patientId)
            // @ts-ignore
            // @ts-ignore
            .headers(withRollbarTrace())
            .single();

        if (profileError) {
            reportError(profileError, 'therapistService:getPatientProfile', { patientId });
            return null;
        }

        const { data: goals, error: goalsError } = await supabase
            .from('patient_goals')
            .select('*')
            .eq('patient_id', patientId)
            // @ts-ignore
            .headers(withRollbarTrace());

        if (goalsError) {
            reportError(goalsError, 'therapistService:getPatientProfile:goals', { patientId });
        }

        const { data: notes, error: notesError } = await supabase
            .from('therapist_notes')
            .select('*')
            .eq('patient_id', patientId)
            // @ts-ignore
            .headers(withRollbarTrace());

        if (notesError) {
            reportError(notesError, 'therapistService:getPatientProfile:notes', { patientId });
        }

        return {
            profile,
            goals: goals || [],
            notes: notes || []
        };
    } catch (error) {
        reportError(error, 'therapistService:getPatientProfile', { patientId });
        return null;
    } finally {
        endSpan();
    }
};

export const createTherapistNote = async (note: Omit<TherapistNote, 'id' | 'created_at' | 'updated_at'>, practiceId?: string) => {
    startSpan('api.therapist.createTherapistNote');
    try {
        const { data, error } = await supabase
            .from('therapist_notes')
            .insert({
                ...note,
                practice_id: practiceId
            } as any)
            // @ts-ignore
            // @ts-ignore
            .headers(withRollbarTrace())
            .select()
            .single();

        if (error) {
            reportError(error, 'therapistService:createTherapistNote', {
                patientId: note.patient_id
            });
            throw error;
        }

        return data;
    } catch (error) {
        reportError(error, 'therapistService:createTherapistNote');
        throw error;
    } finally {
        endSpan();
    }
};

export const updateTherapistNote = async (noteId: string, updates: Partial<TherapistNote>) => {
    startSpan('api.therapist.updateTherapistNote');
    try {
        const { data, error } = await supabase
            .from('therapist_notes')
            .update(updates)
            .eq('id', noteId)
            // @ts-ignore
            // @ts-ignore
            .headers(withRollbarTrace())
            .select()
            .single();

        if (error) {
            reportError(error, 'therapistService:updateTherapistNote', { noteId });
            throw error;
        }

        return data;
    } catch (error) {
        reportError(error, 'therapistService:updateTherapistNote', { noteId });
        throw error;
    } finally {
        endSpan();
    }
};

export const deleteTherapistNote = async (noteId: string) => {
    startSpan('api.therapist.deleteTherapistNote');
    try {
        const { error } = await supabase
            .from('therapist_notes')
            .delete()
            .eq('id', noteId)
            // @ts-ignore
            .headers(withRollbarTrace());

        if (error) {
            reportError(error, 'therapistService:deleteTherapistNote', { noteId });
            throw error;
        }
    } catch (error) {
        reportError(error, 'therapistService:deleteTherapistNote', { noteId });
        throw error;
    } finally {
        endSpan();
    }
};

export const createPatientGoal = async (goal: Omit<PatientGoal, 'id' | 'created_at' | 'updated_at'>, practiceId?: string) => {
    startSpan('api.therapist.createPatientGoal');
    try {
        const { data, error } = await supabase
            .from('patient_goals')
            .insert({
                ...goal,
                practice_id: practiceId
            } as any)
            // @ts-ignore
            // @ts-ignore
            .headers(withRollbarTrace())
            .select()
            .single();

        if (error) {
            reportError(error, 'therapistService:createPatientGoal', {
                patientId: goal.patient_id
            });
            throw error;
        }

        return data;
    } catch (error) {
        reportError(error, 'therapistService:createPatientGoal');
        throw error;
    } finally {
        endSpan();
    }
};

export const updatePatientGoal = async (goalId: string, updates: Partial<PatientGoal>) => {
    startSpan('api.therapist.updatePatientGoal');
    try {
        const { data, error } = await supabase
            .from('patient_goals')
            .update(updates)
            .eq('id', goalId)
            // @ts-ignore
            // @ts-ignore
            .headers(withRollbarTrace())
            .select()
            .single();

        if (error) {
            reportError(error, 'therapistService:updatePatientGoal', { goalId });
            throw error;
        }

        return data;
    } catch (error) {
        reportError(error, 'therapistService:updatePatientGoal', { goalId });
        throw error;
    } finally {
        endSpan();
    }
};


export const updateAppointmentStatus = async (appointmentId: string, status: string, notes?: string) => {
    const updates: any = { status };
    if (notes) updates.notes = notes;

    const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// New functions

export const searchAvailablePatients = async (therapistId: string, searchQuery: string, category?: string, practiceId?: string) => {
    // 1. Fetch all profiles with role 'patient'
    let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient');

    if (practiceId) {
        query = query.eq('practice_id', practiceId);
    }

    if (category && category !== 'All') {
        // Assuming 'specialization' or 'expertise_areas' holds the category
        // Using 'contains' for array or 'ilike' for text. 
        // Let's assume expertise_areas is the array of categories/interests for patients
        query = query.contains('expertise_areas', [category]);
    }

    const { data: allPatients, error: patientsError } = await query;

    if (patientsError) throw patientsError;

    // 2. Fetch existing relationships for this therapist to exclude them
    const { data: existingRelationships, error: relError } = await supabase
        .from('therapist_patient_relationships')
        .select('patient_id')
        .eq('therapist_id', therapistId)
        .in('status', ['active', 'pending', 'completed']); // meaningful statuses to exclude

    if (relError) throw relError;

    const excludedPatientIds = new Set(existingRelationships?.map(r => r.patient_id) || []);

    // 3. Filter out existing relationships and apply search query
    let availablePatients = (allPatients || []).filter(m => !excludedPatientIds.has(m.user_id));

    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        availablePatients = availablePatients.filter(m =>
            (m.full_name?.toLowerCase().includes(lowerQuery)) ||
            (m.bio?.toLowerCase().includes(lowerQuery)) ||
            (m.specialization?.toLowerCase().includes(lowerQuery)) ||
            (m.expertise_areas?.some((area: string) => area.toLowerCase().includes(lowerQuery)))
        );
    }

    // 4. sort by some mechanic, e.g. those with most matching interests (simple logic for now)
    // could be improved with a match score
    return availablePatients;
};

export const invitePatient = async (therapistId: string, patientEmail: string, message?: string) => {
    // Generate a random token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { data, error } = await supabase
        .from('patient_invitations')
        .insert({
            therapist_id: therapistId,
            patient_email: patientEmail,
            invitation_message: message,
            invitation_token: token,
            expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const addPatientToRoster = async (therapistId: string, patientId: string, notes?: string, practiceId?: string) => {
    const { data, error } = await supabase
        .from('therapist_patient_relationships')
        .insert({
            therapist_id: therapistId,
            patient_id: patientId,
            status: 'active',
            notes,
            assigned_by: therapistId,
            practice_id: practiceId
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const removePatientFromRoster = async (relationshipId: string, reason?: string) => {
    const { data, error } = await supabase
        .from('therapist_patient_relationships')
        .update({
            status: 'inactive',
            end_date: new Date().toISOString(),
            notes: reason // Appending reason to notes would be better, but replacing for simplicity
        })
        .eq('id', relationshipId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deactivatePatientRelationship = async (therapistId: string, patientId: string) => {
    // Find all active/pending relationships (handling potential duplicates)
    const { data: rels, error: fetchError } = await supabase
        .from('therapist_patient_relationships')
        .select('id')
        .eq('therapist_id', therapistId)
        .eq('patient_id', patientId)
        .in('status', ['active', 'pending']);

    if (fetchError) throw fetchError;

    // If no active relationship found, consider it already done
    if (!rels || rels.length === 0) {
        return null;
    }

    // Deactivate all found relationships found to ensure clean state
    const results = await Promise.all(rels.map(rel =>
        removePatientFromRoster(rel.id, 'Removed by therapist')
    ));

    return results[0];
};

export const referPatientToTherapist = async (patientId: string, fromTherapistId: string, toTherapistId: string, reason: string, notes?: string, practiceId?: string) => {
    const { data, error } = await supabase
        .from('patient_referrals')
        .insert({
            patient_id: patientId,
            referring_therapist_id: fromTherapistId,
            referred_to_therapist_id: toTherapistId,
            referral_reason: reason,
            referral_notes: notes,
            practice_id: practiceId
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getReferralsReceived = async (therapistId: string, practiceId?: string) => {
    let query = supabase
        .from('patient_referrals')
        .select('*, referring_therapist:profiles!referring_therapist_id(*), patient:profiles!patient_id(*)')
        .eq('referred_to_therapist_id', therapistId);

    if (practiceId) {
        query = query.eq('practice_id', practiceId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
};

export const getReferralsSent = async (therapistId: string, practiceId?: string) => {
    let query = supabase
        .from('patient_referrals')
        .select('*, referred_to_therapist:profiles!referred_to_therapist_id(*), patient:profiles!patient_id(*)')
        .eq('referring_therapist_id', therapistId);

    if (practiceId) {
        query = query.eq('practice_id', practiceId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
};

export const respondToReferral = async (referralId: string, status: 'accepted' | 'declined', notes?: string, practiceId?: string) => {
    let query = supabase
        .from('patient_referrals')
        .update({
            status,
            response_notes: notes,
            responded_at: new Date().toISOString()
        })
        .eq('id', referralId);

    if (practiceId) {
        query = query.eq('practice_id', practiceId);
    }

    const { data, error } = await query.select().single();

    if (error) throw error;
    return data;
};

export const getTherapistPatientRelationships = async (therapistId: string) => {
    const { data, error } = await supabase
        .rpc('get_therapist_relationships', { therapist_id_input: therapistId });

    if (error) throw error;
    return data;
};

export const createSession = async (
    therapistId: string,
    practiceId: string,
    patientId: string | null,
    startTime: Date,
    durationMinutes: number,
    notes?: string,
    price?: number,
    sessionType: 'private' | 'public' = 'private',
    title?: string
) => {
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    if (await checkAppointmentConflict(therapistId, startTime.toISOString(), endTime.toISOString())) {
        throw new Error('Time slot conflict');
    }

    const appointmentData = {
        therapist_id: therapistId,
        patient_id: patientId,
        practice_id: practiceId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending' as const,
        notes: notes ?? null,
        meeting_link: null, // Will be generated after appointment creation
        feedback: null,
        price: price || 0,
        payment_required: (price ?? 0) > 0,
        payment_status: (price ?? 0) > 0 ? 'pending' : 'not_required',
        video_room_id: null,
        session_type: sessionType,
        title: title ?? (sessionType === 'public' ? 'Public Session' : null)
    };

    const appointment = await createAppointment(appointmentData);

    // Generate Daily.co meeting link
    if (appointment) {
        try {
            const meetingLink = await generateDailyMeetLink(appointment.id);
            await supabase
                .from('appointments')
                .update({
                    meeting_link: meetingLink,
                    status: (price ?? 0) > 0 ? 'pending' : 'confirmed'
                })
                .eq('id', appointment.id);
        } catch (error) {
            console.error('Error generating meeting link:', error);
            reportError(error, 'createSession:generateDailyMeetLink');
            // Appointment still exists but without a link yet
        }
    }

    return appointment;
};

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at'>, practiceId?: string) => {
    const { data, error } = await supabase
        .from('appointments')
        .insert({
            ...appointment,
            practice_id: practiceId
        } as any)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const checkAppointmentConflict = async (
    therapistId: string,
    startTime: string,
    endTime: string
) => {
    const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('therapist_id', therapistId)
        .neq('status', 'cancelled')
        .lt('start_time', endTime)
        .gt('end_time', startTime);

    if (error) throw error;
    return data && data.length > 0;
};

export const createManagedPatient = async (therapistId: string, email: string, fullName: string) => {
    const { data, error } = await supabase.functions.invoke('create-managed-patient', {
        body: { therapist_id: therapistId, email, full_name: fullName },
        headers: withRollbarSpan('createManagedPatient')
    });

    if (error) {
        console.error("Function Invoke Error", error);
        reportError(error, 'createManagedPatient:invoke', { trace_id: getTraceId() });
        endSpan();
        throw error;
    }

    endSpan();

    // Check for application level error from the function
    if (data && data.error) {
        reportError(new Error(data.error), 'createManagedPatient:app_error', { trace_id: getTraceId() });
        throw new Error(data.error);
    }

    return data;
};
