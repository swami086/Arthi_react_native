import { supabase } from './supabase';
import { MenteeGoal, MentorNote, MentorStats, MenteeWithActivity, Appointment } from './types';
import { generateDailyMeetLink } from '../utils/meetingLink';
import { reportError, withRollbarTrace, startSpan, endSpan, startTimer, endTimer, withRollbarSpan, getTraceId } from '../services/rollbar';

export const getMentorStats = async (mentorId: string): Promise<MentorStats | null> => {
    startSpan('api.mentor.getMentorStats');
    startTimer('mentor_stats_fetch');
    try {
        const { data, error } = await supabase
            // @ts-ignore
            .rpc('get_mentor_stats', { mentor_user_id: mentorId });

        if (error) {
            reportError(error, 'mentorService:getMentorStats', { mentorId });
            return null;
        }

        endTimer('mentor_stats_fetch', 'mentorService:getMentorStats', { mentorId });
        return data as MentorStats;
    } catch (error) {
        reportError(error, 'mentorService:getMentorStats', { mentorId });
        return null;
    } finally {
        endSpan();
    }
};

export const getMenteeList = async (mentorId: string): Promise<MenteeWithActivity[]> => {
    startSpan('api.mentor.getMenteeList');
    startTimer('mentee_list_fetch');
    try {
        const { data, error } = await supabase
            // @ts-ignore
            .rpc('get_mentee_list_for_mentor', { mentor_user_id: mentorId });

        if (error) {
            reportError(error, 'mentorService:getMenteeList', { mentorId });
            return [];
        }

        endTimer('mentee_list_fetch', 'mentorService:getMenteeList', {
            mentorId,
            menteeCount: data?.length || 0
        });
        return data as MenteeWithActivity[];
    } catch (error) {
        reportError(error, 'mentorService:getMenteeList', { mentorId });
        return [];
    } finally {
        endSpan();
    }
};

export const getMenteeProfile = async (menteeId: string) => {
    startSpan('api.mentor.getMenteeProfile');
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
            reportError(profileError, 'mentorService:getMenteeProfile', { menteeId });
            return null;
        }

        const { data: goals, error: goalsError } = await supabase
            .from('mentee_goals')
            .select('*')
            .eq('mentee_id', menteeId)
            // @ts-ignore
            .headers(withRollbarTrace());

        if (goalsError) {
            reportError(goalsError, 'mentorService:getMenteeProfile:goals', { menteeId });
        }

        const { data: notes, error: notesError } = await supabase
            .from('mentor_notes')
            .select('*')
            .eq('mentee_id', menteeId)
            // @ts-ignore
            .headers(withRollbarTrace());

        if (notesError) {
            reportError(notesError, 'mentorService:getMenteeProfile:notes', { menteeId });
        }

        return {
            profile,
            goals: goals || [],
            notes: notes || []
        };
    } catch (error) {
        reportError(error, 'mentorService:getMenteeProfile', { menteeId });
        return null;
    } finally {
        endSpan();
    }
};

export const createMentorNote = async (note: Omit<MentorNote, 'id' | 'created_at' | 'updated_at'>) => {
    startSpan('api.mentor.createMentorNote');
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
            reportError(error, 'mentorService:createMentorNote', {
                menteeId: note.mentee_id
            });
            throw error;
        }

        return data;
    } catch (error) {
        reportError(error, 'mentorService:createMentorNote');
        throw error;
    } finally {
        endSpan();
    }
};

export const updateMentorNote = async (noteId: string, updates: Partial<MentorNote>) => {
    startSpan('api.mentor.updateMentorNote');
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
            reportError(error, 'mentorService:updateMentorNote', { noteId });
            throw error;
        }

        return data;
    } catch (error) {
        reportError(error, 'mentorService:updateMentorNote', { noteId });
        throw error;
    } finally {
        endSpan();
    }
};

export const deleteMentorNote = async (noteId: string) => {
    startSpan('api.mentor.deleteMentorNote');
    try {
        const { error } = await supabase
            .from('mentor_notes')
            .delete()
            .eq('id', noteId)
            // @ts-ignore
            .headers(withRollbarTrace());

        if (error) {
            reportError(error, 'mentorService:deleteMentorNote', { noteId });
            throw error;
        }
    } catch (error) {
        reportError(error, 'mentorService:deleteMentorNote', { noteId });
        throw error;
    } finally {
        endSpan();
    }
};

export const createMenteeGoal = async (goal: Omit<MenteeGoal, 'id' | 'created_at' | 'updated_at'>) => {
    startSpan('api.mentor.createMenteeGoal');
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
            reportError(error, 'mentorService:createMenteeGoal', {
                menteeId: goal.mentee_id
            });
            throw error;
        }

        return data;
    } catch (error) {
        reportError(error, 'mentorService:createMenteeGoal');
        throw error;
    } finally {
        endSpan();
    }
};

export const updateMenteeGoal = async (goalId: string, updates: Partial<MenteeGoal>) => {
    startSpan('api.mentor.updateMenteeGoal');
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
            reportError(error, 'mentorService:updateMenteeGoal', { goalId });
            throw error;
        }

        return data;
    } catch (error) {
        reportError(error, 'mentorService:updateMenteeGoal', { goalId });
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

export const searchAvailableMentees = async (mentorId: string, searchQuery: string, category?: string) => {
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

    const { data: allMentees, error: menteesError } = await query;

    if (menteesError) throw menteesError;

    // 2. Fetch existing relationships for this mentor to exclude them
    const { data: existingRelationships, error: relError } = await supabase
        .from('mentor_mentee_relationships')
        .select('mentee_id')
        .eq('mentor_id', mentorId)
        .in('status', ['active', 'pending', 'completed']); // meaningful statuses to exclude

    if (relError) throw relError;

    const excludedMenteeIds = new Set(existingRelationships?.map(r => r.mentee_id) || []);

    // 3. Filter out existing relationships and apply search query
    let availableMentees = (allMentees || []).filter(m => !excludedMenteeIds.has(m.user_id));

    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        availableMentees = availableMentees.filter(m =>
            (m.full_name?.toLowerCase().includes(lowerQuery)) ||
            (m.bio?.toLowerCase().includes(lowerQuery)) ||
            (m.specialization?.toLowerCase().includes(lowerQuery)) ||
            (m.expertise_areas?.some((area: string) => area.toLowerCase().includes(lowerQuery)))
        );
    }

    // 4. sort by some mechanic, e.g. those with most matching interests (simple logic for now)
    // could be improved with a match score
    return availableMentees;
};

export const inviteMentee = async (mentorId: string, menteeEmail: string, message?: string) => {
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

export const addMenteeToRoster = async (mentorId: string, menteeId: string, notes?: string) => {
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

export const removeMenteeFromRoster = async (relationshipId: string, reason?: string) => {
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

export const deactivateMenteeRelationship = async (mentorId: string, menteeId: string) => {
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
        removeMenteeFromRoster(rel.id, 'Removed by mentor')
    ));

    return results[0];
};

export const referMenteeToMentor = async (menteeId: string, fromMentorId: string, toMentorId: string, reason: string, notes?: string) => {
    const { data, error } = await supabase
        .from('mentee_referrals')
        .insert({
            mentee_id: menteeId,
            referring_mentor_id: fromMentorId,
            referred_to_mentor_id: toMentorId,
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

export const getMentorMenteeRelationships = async (mentorId: string) => {
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

export const createManagedMentee = async (mentorId: string, email: string, fullName: string) => {
    const { data, error } = await supabase.functions.invoke('create-managed-mentee', {
        body: { mentor_id: mentorId, email, full_name: fullName },
        headers: withRollbarSpan('createManagedMentee')
    });

    if (error) {
        console.error("Function Invoke Error", error);
        reportError(error, 'createManagedMentee:invoke', { trace_id: getTraceId() });
        endSpan();
        throw error;
    }

    endSpan();

    // Check for application level error from the function
    if (data && data.error) {
        reportError(new Error(data.error), 'createManagedMentee:app_error', { trace_id: getTraceId() });
        throw new Error(data.error);
    }

    return data;
};
