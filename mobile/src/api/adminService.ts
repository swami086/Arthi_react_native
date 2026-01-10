import { supabase } from './supabase';
import { reportError, withRollbarTrace, startSpan, endSpan } from '../services/rollbar';
import { Profile, AdminAction } from './types';

export const getPendingTherapists = async () => {
    startSpan('api.admin.getPendingTherapists');
    try {
        const { data, error } = await supabase
            .rpc('get_pending_mentors');

        if (error) {
            reportError(error, 'adminService:getPendingTherapists', {
                operation: 'fetch_pending_mentors'
            });
            throw error;
        }

        return data as Profile[];
    } catch (error) {
        reportError(error, 'adminService:getPendingTherapists');
        throw error;
    } finally {
        endSpan();
    }
};

export const approveTherapist = async (mentorId: string, adminId: string, notes?: string) => {
    // Start a transaction if possible, or sequence of ops
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            approval_status: 'approved',
            approval_date: new Date().toISOString(),
            approved_by: adminId
        })
        .eq('user_id', mentorId);

    if (updateError) throw updateError;

    await logAdminAction(adminId, 'approve_mentor', mentorId, { notes });
};

export const rejectTherapist = async (mentorId: string, adminId: string, reason: string) => {
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            approval_status: 'rejected',
            rejection_reason: reason,
            approval_date: new Date().toISOString(),
            approved_by: adminId
        })
        .eq('user_id', mentorId);

    if (updateError) throw updateError;

    await logAdminAction(adminId, 'reject_mentor', mentorId, { reason });
};

export const getAllTherapists = async (status?: string) => {
    let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor');

    if (status) {
        query = query.eq('approval_status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Profile[];
};

export const getAllPatients = async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentee');

    if (error) throw error;
    return data as Profile[];
};

export const getTherapistDetails = async (mentorId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', mentorId)
        .single();

    if (error) throw error;
    return data as Profile;
};

export const getAdminStats = async () => {
    startSpan('api.admin.getAdminStats');
    try {
        const { data, error } = await supabase
            .rpc('get_admin_dashboard_stats');

        if (error) {
            reportError(error, 'adminService:getAdminStats');
            throw error;
        }

        return data;
    } catch (error) {
        reportError(error, 'adminService:getAdminStats');
        throw error;
    } finally {
        endSpan();
    }
};

export const createAdmin = async (email: string, fullName: string, isSuperAdmin = false) => {
    startSpan('api.admin.createAdmin');
    try {
        const { data, error } = await supabase
            .rpc('create_admin_account', {
                email_input: email,
                full_name_input: fullName,
                is_super_admin_input: isSuperAdmin
            });

        if (error) {
            reportError(error, 'adminService:createAdmin', {
                email: '[REDACTED]',
                isSuperAdmin
            });
            throw error;
        }

        return data;
    } catch (error) {
        reportError(error, 'adminService:createAdmin');
        throw error;
    } finally {
        endSpan();
    }
};

export const getAllAdmins = async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin');

    if (error) throw error;
    return data as Profile[];
};

export const logAdminAction = async (adminId: string, actionType: AdminAction['action_type'], targetUserId: string, details: any) => {
    const { error } = await supabase
        .from('admin_actions')
        .insert({
            admin_id: adminId,
            action_type: actionType,
            target_user_id: targetUserId,
            details
        });

    if (error) {
        console.error('Error logging admin action:', error);
        reportError(error, 'adminService:logAdminAction');
    }
};
