'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import rollbar from '@/lib/rollbar';

export async function createNoteAction(formData: { patientId: string; content: string; isPrivate: boolean }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        const { data, error } = await (supabase.from('therapist_notes') as any).insert({
            therapist_id: user.id,
            patient_id: formData.patientId,
            content: formData.content,
            is_private: formData.isPrivate
        })
            .select()
            .single();

        if (error) throw error;

        revalidatePath(`/therapist/patients/${formData.patientId}`);
        return { success: true, data };
    } catch (error: any) {
        rollbar.error('Error creating therapist note', error, { user_id: user.id, formData });
        throw new Error(error.message);
    }
}

export async function createGoalAction(formData: { patientId: string; title: string; progress: number; targetDate?: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        const { data, error } = await (supabase.from('patient_goals') as any).insert({
            therapist_id: user.id,
            patient_id: formData.patientId,
            title: formData.title,
            progress: formData.progress,
            target_date: formData.targetDate
        })
            .select()
            .single();

        if (error) throw error;

        revalidatePath(`/therapist/patients/${formData.patientId}`);
        return { success: true, data };
    } catch (error: any) {
        rollbar.error('Error creating patient goal', error, { user_id: user.id, formData });
        throw new Error(error.message);
    }
}

export async function invitePatientAction(patientId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    try {
        // Check if relationship already exists
        const { data: existing } = await (supabase.from('therapist_patient_relationships') as any)
            .select('id')
            .match({ therapist_id: user.id, patient_id: patientId })
            .maybeSingle();

        if (existing) {
            return { success: false, error: 'Invite already sent or connected' };
        }

        const { error } = await (supabase.from('therapist_patient_relationships') as any).insert({
            therapist_id: user.id,
            patient_id: patientId,
            status: 'pending',
            invited_by: 'therapist'
        });

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        rollbar.error('Error inviting patient', error, { user_id: user.id, patientId });
        return { success: false, error: error.message };
    }
}

export async function createPatientAction(formData: { email: string; fullName: string; phoneNumber?: string }) {
    const supabase = await createClient();
    const { data: { user: therapist } } = await supabase.auth.getUser();
    if (!therapist) throw new Error('Unauthorized');

    try {
        // Get therapist's practice_id
        const { data: therapistProfile } = await (supabase.from('profiles') as any)
            .select('practice_id')
            .eq('user_id', therapist.id)
            .single();

        if (!therapistProfile?.practice_id) {
            return { success: false, error: 'Therapist profile not found or missing practice' };
        }

        // Use admin client for user creation
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return { success: false, error: 'Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY in .env.local' };
        }
        
        const adminClient = createAdminClient();
        
        // Check if user with this email already exists
        let existingUser;
        try {
            const { data } = await adminClient.auth.admin.listUsers();
            existingUser = data.users.find(u => u.email === formData.email);
        } catch (err) {
            // If list fails, try to get by email directly
            try {
                const { data } = await adminClient.auth.admin.getUserByEmail(formData.email);
                existingUser = data.user;
            } catch (e) {
                // User doesn't exist, continue
            }
        }
        
        let patientUserId: string;
        
        if (existingUser) {
            // User exists, check if they're already a patient
            patientUserId = existingUser.id;
            
            const { data: existingProfile } = await (supabase.from('profiles') as any)
                .select('role, user_id')
                .eq('user_id', patientUserId)
                .single();

            if (existingProfile?.role !== 'patient') {
                return { success: false, error: 'User with this email already exists with a different role' };
            }
        } else {
            // Create new auth user using admin client
            // Generate a temporary password (user will need to reset it)
            const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
            
            const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
                email: formData.email,
                password: tempPassword,
                email_confirm: true, // Auto-confirm email
                user_metadata: {
                    full_name: formData.fullName,
                    role: 'patient',
                },
            });

            if (authError || !authData.user) {
                return { success: false, error: authError?.message || 'Failed to create user account' };
            }

            patientUserId = authData.user.id;

            // Wait a moment for the trigger to create the profile
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update profile with additional info
            const { error: profileError } = await (supabase.from('profiles') as any)
                .update({
                    full_name: formData.fullName,
                    phone_number: formData.phoneNumber || null,
                })
                .eq('user_id', patientUserId);

            if (profileError) {
                console.warn('Profile update error (may be fine if trigger handled it):', profileError);
            }
        }

        // Create patient record
        const { data: profile } = await (supabase.from('profiles') as any)
            .select('user_id')
            .eq('user_id', patientUserId)
            .single();

        if (!profile) {
            return { success: false, error: 'Failed to find patient profile' };
        }

        // Use admin client for inserts to bypass RLS
        // Check if patient record exists
        const { data: existingPatient } = await (adminClient.from('patients') as any)
            .select('id')
            .eq('profile_id', patientUserId)
            .maybeSingle();

        if (!existingPatient) {
            const { error: patientError } = await (adminClient.from('patients') as any).insert({
                profile_id: patientUserId,
                practice_id: therapistProfile.practice_id,
            });

            if (patientError) {
                console.error('Patient record creation error:', patientError);
                return { success: false, error: `Failed to create patient record: ${patientError.message}` };
            }
        }

        // Create therapist-patient relationship using admin client
        const { data: existingRelationship } = await (adminClient.from('therapist_patient_relationships') as any)
            .select('id')
            .match({ therapist_id: therapist.id, patient_id: patientUserId })
            .maybeSingle();

        if (!existingRelationship) {
            const { error: relationshipError } = await (adminClient.from('therapist_patient_relationships') as any).insert({
                therapist_id: therapist.id,
                patient_id: patientUserId,
                status: 'active',
                assigned_by: therapist.id,
                practice_id: therapistProfile.practice_id,
            });

            if (relationshipError) {
                console.error('Relationship creation error:', relationshipError);
                return { success: false, error: `Failed to create relationship: ${relationshipError.message}` };
            }
        }

        revalidatePath('/therapist/patients');
        return { success: true, data: { patientId: patientUserId } };
    } catch (error: any) {
        console.error('[createPatientAction] Error:', error);
        rollbar.error('Error creating patient', error, { user_id: therapist.id, formData });
        return { success: false, error: error.message || 'Failed to create patient' };
    }
}
