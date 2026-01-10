import { supabase } from './supabase';
import { PatientGoal, TherapistNote, TherapistStats, PatientWithActivity, Appointment } from './types';
import { generateDailyMeetLink } from '../utils/meetingLink';
import { reportError, withRollbarTrace, startSpan, endSpan, startTimer, endTimer, withRollbarSpan, getTraceId } from '../services/rollbar';

export const getTherapistStats = async (mentorId: string): Promise<TherapistStats | null> => {
    startSpan('api.mentor.getTherapistStats');
    startTimer('mentor_stats_fetch');
    try {
        const { data, error } = await supabase
            // @ts-ignore
            .rpc('get_mentor_stats', { mentor_user_id: mentorId });

        if (error) {
            reportError(error, 'mentorService:getTherapistStats', { mentorId });
            return null;
        }

        endTimer('mentor_stats_fetch', 'mentorService:getTherapistStats', { mentorId });
        return data as TherapistStats;
    } catch (error) {
        reportError(error, 'mentorService:getTherapistStats', { mentorId });
        return null;
    } finally {
        endSpan();
    }
};

export const getPatientList = async (mentorId: string): Promise<PatientWithActivity[]> => {
    startSpan('api.mentor.getPatientList');
    startTimer('mentee_list_fetch');
    try {
        const { data, error } = await supabase
            // @ts-ignore
            .rpc('get_mentee_list_for_mentor', { mentor_user_id: mentorId });

        if (error) {
            reportError(error, 'mentorService:getPatientList', { mentorId });
            return [];
        }

        endTimer('mentee_list_fetch', 'mentorService:getPatientList', {
            mentorId,
            menteeCount: data?.length || 0
        });
        return data as PatientWithActivity[];
    } catch (error) {
        reportError(error, 'mentorService:getPatientList', { mentorId });
        return [];
    } finally {
        endSpan();
    }
};

export const getPatientProfile = async (menteeId: string) => {
    startSpan('api.mentor.getPatientProfile');
    try {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', menteeId)
            // @ts-ignore
            // @ts-ignore
            .headers(withRollbarTrace())
            .single();

        if (profileError) {
            reportError(profileError, 'mentorService:getPatientProfile', { menteeId });
            return null;
        }

        const { data: goals, error: goalsError } = await supabase
            .from('mentee_goals')
            .select('*')
            .eq('mentee_id', menteeId)
            // @ts-ignore
            .headers(withRollbarTrace());

        if (goalsError) {
            reportError(goalsError, 'mentorService:getPatientProfile:goals', { menteeId });
        }

        const { data: notes, error: notesError } = await supabase
            .from('mentor_notes')
            .select('*')
            .eq('mentee_id', menteeId)
            // @ts-ignore
            .headers(withRollbarTrace());

        if (notesError) {
            reportError(notesError, 'mentorService:getPatientProfile:notes', { menteeId });
        }

        return {
            profile,
            goals: goals || [],
            notes: notes || []
        };
    } catch (error) {
        reportError(error, 'mentorService:getPatientProfile', { menteeId });
        return null;
    } finally {
        endSpan();
    }
};

export const createTherapistNote = async (note: Omit<TherapistNote, 'id' | 'created_at' | 'updated_at'>) => {
    startSpan('api.mentor.createTherapistNote');
    try {
        const { data, error } = await supabase
            .from('mentor_notes')
            .insert(note as any)
            // @ts-ignore
            // @ts-ignore
            .headers(withRollbarTrace())
            .select()
            .single();

        if (error) {
            reportError(error, 'mentorService:createTherapistNote', {
                menteeId: note.mentee_id
            });
            throw error;
        }

        return data;
    } catch (error) {
        reportError(error, 'mentorService:createTherapistNote');
        throw error;
    } finally {
        endSpan();
    }
};

export const updateTherapistNote = async (noteId: string, updates: Partial<TherapistNote>) => {
    startSpan('api.mentor.updateTherapistNote');
    try {
        const { data, error } = await supabase
            .from('mentor_notes')
            .update(updates)
            .eq('id', noteId)
            // @ts-ignore
            // @ts-ignore
            .headers(withRollbarTrace())
            .select()
            .single();

        if (error) {
            reportError(error, 'mentorService:updateTherapistNote', { noteId });
            throw error;
        }

        return data;
    } catch (error) {
        reportError(error, 'mentorService:updateTherapistNote', { noteId });
        throw error;
    } finally {
        endSpan();
    }
};

export const deleteTherapistNote = async (noteId: string) => {
    startSpan('api.mentor.deleteTherapistNote');
    try {
        const { error } = await supabase
            .from('mentor_notes')
            .delete()
            .eq('id', noteId)
            // @ts-ignore
            .headers(withRollbarTrace());

        if (error) {
            reportError(error, 'mentorService:deleteTherapistNote', { noteId });
            throw error;
        }
    } catch (error) {
        reportError(error, 'mentorService:deleteTherapistNote', { noteId });
        throw error;
    } finally {
        endSpan();
    }
};

export const createPatientGoal = async (goal: Omit<PatientGoal, 'id' | 'created_at' | 'updated_at'>) => {
    startSpan('api.mentor.createPatientGoal');
    try {
        const { data, error } = await supabase
            .from('mentee_goals')
            .insert(goal as any)
            // @ts-ignore
            // @ts-ignore
            .headers(withRollbarTrace())
            .select()
            .single();

        if (error) {
            reportError(error, 'mentorService:createPatientGoal', {
                menteeId: goal.mentee_id
            });
            throw error;
        }

        return data;
    } catch (error) {
        reportError(error, 'mentorService:createPatientGoal');
        throw error;
    } finally {
        endSpan();
    }
};

export const updatePatientGoal = async (goalId: string, updates: Partial<PatientGoal>) => {
    startSpan('api.mentor.updatePatientGoal');
    try {
        const { data, error } = await supabase
            .from('mentee_goals')
            .update(updates)
            .eq('id', goalId)
            // @ts-ignore
            // @ts-ignore
            .headers(withRollbarTrace())
            .select()
            .single();

        if (error) {
            reportError(error, 'mentorService:updatePatientGoal', { goalId });
            throw error;
        }

        return data;
    } catch (error) {
        reportError(error, 'mentorService:updatePatientGoal', { goalId });
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

export const searchAvailablePatients = async (mentorId: string, searchQuery: string, category?: string) => {
    // 1. Fetch all profiles with role 'mentee'
    let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentee');

    if (category && category !== 'All') {
        // Assuming 'specialization' or 'expertise_areas' holds the category
        // Using 'contains' for array or 'ilike' for text. 
        // Let's assume expertise_areas is the array of categories/interests for mentees
        query = query.contains('expertise_areas', [category]);
    }

    const { data: allPatients, error: menteesError } = await query;

    if (menteesError) throw menteesError;

    // 2. Fetch existing relationships for this mentor to exclude them
    const { data: existingRelationships, error: relError } = await supabase
        .from('mentor_mentee_relationships')
        .select('mentee_id')
        .eq('mentor_id', mentorId)
        .in('status', ['active', 'pending', 'completed']); // meaningful statuses to exclude

    if (relError) throw relError;

    const excludedPatientIds = new Set(existingRelationships?.map(r => r.mentee_id) || []);

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

export const invitePatient = async (mentorId: string, menteeEmail: string, message?: string) => {
    // Generate a random token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { data, error } = await supabase
        .from('mentee_invitations')
        .insert({
            mentor_id: mentorId,
            mentee_email: menteeEmail,
            invitation_message: message,
            invitation_token: token,
            expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const addPatientToRoster = async (mentorId: string, menteeId: string, notes?: string) => {
    const { data, error } = await supabase
        .from('mentor_mentee_relationships')
        .insert({
            mentor_id: mentorId,
            mentee_id: menteeId,
            status: 'active',
            notes,
            assigned_by: mentorId
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const removePatientFromRoster = async (relationshipId: string, reason?: string) => {
    const { data, error } = await supabase
        .from('mentor_mentee_relationships')
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

export const deactivatePatientRelationship = async (mentorId: string, menteeId: string) => {
    // Find all active/pending relationships (handling potential duplicates)
    const { data: rels, error: fetchError } = await supabase
        .from('mentor_mentee_relationships')
        .select('id')
        .eq('mentor_id', mentorId)
        .eq('mentee_id', menteeId)
        .in('status', ['active', 'pending']);

    if (fetchError) throw fetchError;

    // If no active relationship found, consider it already done
    if (!rels || rels.length === 0) {
        return null;
    }

    // Deactivate all found relationships found to ensure clean state
    const results = await Promise.all(rels.map(rel =>
        removePatientFromRoster(rel.id, 'Removed by mentor')
    ));

    return results[0];
};

export const referPatientToTherapist = async (menteeId: string, fromTherapistId: string, toTherapistId: string, reason: string, notes?: string) => {
    const { data, error } = await supabase
        .from('mentee_referrals')
        .insert({
            mentee_id: menteeId,
            referring_mentor_id: fromTherapistId,
            referred_to_mentor_id: toTherapistId,
            referral_reason: reason,
            referral_notes: notes
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getReferralsReceived = async (mentorId: string) => {
    const { data, error } = await supabase
        .from('mentee_referrals')
        .select('*, referring_mentor:profiles!referring_mentor_id(*), mentee:profiles!mentee_id(*)')
        .eq('referred_to_mentor_id', mentorId);

    if (error) throw error;
    return data;
};

export const getReferralsSent = async (mentorId: string) => {
    const { data, error } = await supabase
        .from('mentee_referrals')
        .select('*, referred_to_mentor:profiles!referred_to_mentor_id(*), mentee:profiles!mentee_id(*)')
        .eq('referring_mentor_id', mentorId);

    if (error) throw error;
    return data;
};

export const respondToReferral = async (referralId: string, status: 'accepted' | 'declined', notes?: string) => {
    const { data, error } = await supabase
        .from('mentee_referrals')
        .update({
            status,
            response_notes: notes,
            responded_at: new Date().toISOString()
        })
        .eq('id', referralId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getTherapistPatientRelationships = async (mentorId: string) => {
    const { data, error } = await supabase
        .rpc('get_mentor_relationships', { mentor_id_input: mentorId });

    if (error) throw error;
    return data;
};

export const createSession = async (
    mentorId: string,
    menteeId: string | null,
    startTime: Date,
    durationMinutes: number,
    notes?: string,
    price?: number,
    sessionType: 'private' | 'public' = 'private',
    title?: string
) => {
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    if (await checkAppointmentConflict(mentorId, startTime.toISOString(), endTime.toISOString())) {
        throw new Error('Time slot conflict');
    }

    const appointmentData = {
        mentor_id: mentorId,
        mentee_id: menteeId,
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

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
        .from('appointments')
        .insert(appointment as any)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const checkAppointmentConflict = async (
    mentorId: string,
    startTime: string,
    endTime: string
) => {
    const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('mentor_id', mentorId)
        .neq('status', 'cancelled')
        .lt('start_time', endTime)
        .gt('end_time', startTime);

    if (error) throw error;
    return data && data.length > 0;
};

export const createManagedPatient = async (mentorId: string, email: string, fullName: string) => {
    const { data, error } = await supabase.functions.invoke('create-managed-mentee', {
        body: { mentor_id: mentorId, email, full_name: fullName },
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
