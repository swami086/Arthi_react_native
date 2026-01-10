import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { AdminStats, AdminActionType, Profile } from '@/types/admin';
import { reportError, startTimer, endTimer, withRollbarSpan, getTraceId } from '../rollbar-utils';

export const adminService = {
    /**
     * Fetch therapists with approval_status='pending'
     */
    async getPendingTherapists(supabase: SupabaseClient<Database>) {
        const spanName = 'adminService:getPendingTherapists';
        startTimer(spanName);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'therapist')
                .eq('approval_status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            endTimer(spanName, 'adminService', { span_name: spanName });
            return data as Profile[];
        } catch (error) {
            reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
            throw error;
        }
    },

    /**
     * Approval process for a therapist
     */
    async approveTherapist(supabase: SupabaseClient<Database>, therapistId: string, adminId: string, notes?: string) {
        const spanName = 'adminService:approveTherapist';
        startTimer(spanName);
        try {
            const { error } = await (supabase
                .from('profiles') as any)
                .update({
                    approval_status: 'approved',
                    approval_date: new Date().toISOString(),
                    approved_by: adminId,
                    therapist_bio_extended: notes || null
                })
                .eq('user_id', therapistId);

            if (error) throw error;

            await this.logAdminAction(supabase, adminId, 'approve_therapist', therapistId, { notes });

            endTimer(spanName, 'adminService', { therapistId, span_name: spanName });
            return { success: true };
        } catch (error) {
            reportError(error, spanName, { therapistId, adminId, span_name: spanName, traceId: getTraceId() });
            throw error;
        }
    },

    /**
     * Rejection process for a therapist
     */
    async rejectTherapist(supabase: SupabaseClient<Database>, therapistId: string, adminId: string, reason: string) {
        const spanName = 'adminService:rejectTherapist';
        startTimer(spanName);
        try {
            const { error } = await (supabase
                .from('profiles') as any)
                .update({
                    approval_status: 'rejected',
                    rejection_reason: reason
                })
                .eq('user_id', therapistId);

            if (error) throw error;

            await this.logAdminAction(supabase, adminId, 'reject_therapist', therapistId, { reason });

            endTimer(spanName, 'adminService', { therapistId, span_name: spanName });
            return { success: true };
        } catch (error) {
            reportError(error, spanName, { therapistId, adminId, span_name: spanName, traceId: getTraceId() });
            throw error;
        }
    },

    /**
     * Fetch all therapists with optional status filter
     */
    async getAllTherapists(supabase: SupabaseClient<Database>, status?: string) {
        const spanName = 'adminService:getAllTherapists';
        startTimer(spanName);
        try {
            let query = supabase
                .from('profiles')
                .select('*')
                .eq('role', 'therapist');

            if (status && status !== 'All') {
                query = query.eq('approval_status', status.toLowerCase());
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;

            endTimer(spanName, 'adminService', { status, span_name: spanName });
            return data as Profile[];
        } catch (error) {
            reportError(error, spanName, { status, span_name: spanName, traceId: getTraceId() });
            throw error;
        }
    },

    /**
     * Fetch all patients
     */
    async getAllPatients(supabase: SupabaseClient<Database>) {
        const spanName = 'adminService:getAllPatients';
        startTimer(spanName);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'patient')
                .order('created_at', { ascending: false });

            if (error) throw error;
            endTimer(spanName, 'adminService', { span_name: spanName });
            return data as Profile[];
        } catch (error) {
            reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
            throw error;
        }
    },

    /**
     * Fetch single therapist profile details
     */
    async getTherapistDetails(supabase: SupabaseClient<Database>, therapistId: string) {
        const spanName = 'adminService:getTherapistDetails';
        startTimer(spanName);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', therapistId)
                .eq('role', 'therapist')
                .single();

            if (error) throw error;
            endTimer(spanName, 'adminService', { therapistId, span_name: spanName });
            return data as Profile;
        } catch (error) {
            reportError(error, spanName, { therapistId, span_name: spanName, traceId: getTraceId() });
            throw error;
        }
    },

    /**
     * Get admin dashboard stats via RPC
     */
    async getAdminStats(supabase: SupabaseClient<Database>) {
        const spanName = 'adminService:getAdminStats';
        startTimer(spanName);
        try {
            const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
            if (error) throw error;

            endTimer(spanName, 'adminService', { span_name: spanName });
            return data as AdminStats;
        } catch (error) {
            reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
            throw error;
        }
    },

    /**
     * Create a new admin account via RPC
     */
    async createAdmin(supabase: SupabaseClient<Database>, email: string, fullName: string, isSuperAdmin: boolean, creatorId: string) {
        const spanName = 'adminService:createAdmin';
        startTimer(spanName);
        try {
            const { data, error } = await (supabase as any).rpc('create_admin_account', {
                p_email: email,
                p_full_name: fullName,
                p_is_super_admin: isSuperAdmin
            });

            if (error) throw error;

            await this.logAdminAction(supabase, creatorId, 'create_admin', data, { email, fullName, isSuperAdmin });

            endTimer(spanName, 'adminService', { email, span_name: spanName });
            return { success: true, data };
        } catch (error) {
            reportError(error, spanName, { email, span_name: spanName, traceId: getTraceId() });
            throw error;
        }
    },

    /**
     * Fetch all admin profiles
     */
    async getAllAdmins(supabase: SupabaseClient<Database>) {
        const spanName = 'adminService:getAllAdmins';
        startTimer(spanName);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'admin')
                .order('created_at', { ascending: false });

            if (error) throw error;
            endTimer(spanName, 'adminService', { span_name: spanName });
            return data as Profile[];
        } catch (error) {
            reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
            throw error;
        }
    },

    /**
     * Update admin role (super admin only)
     */
    async updateAdminRole(supabase: SupabaseClient<Database>, targetAdminId: string, isSuperAdmin: boolean, adminId: string) {
        const spanName = 'adminService:updateAdminRole';
        startTimer(spanName);
        try {
            const { error } = await (supabase
                .from('profiles') as any)
                .update({ is_super_admin: isSuperAdmin })
                .eq('user_id', targetAdminId)
                .eq('role', 'admin');

            if (error) throw error;

            await this.logAdminAction(supabase, adminId, 'update_admin_role' as any, targetAdminId, { isSuperAdmin });

            endTimer(spanName, 'adminService', { targetAdminId, isSuperAdmin, span_name: spanName });
            return { success: true };
        } catch (error) {
            reportError(error, spanName, { targetAdminId, isSuperAdmin, span_name: spanName, traceId: getTraceId() });
            throw error;
        }
    },

    /**
     * Revoke admin access (remove role)
     */
    async revokeAdminAccess(supabase: SupabaseClient<Database>, targetAdminId: string, adminId: string) {
        const spanName = 'adminService:revokeAdminAccess';
        startTimer(spanName);
        try {
            // Change role back to patient or just remove admin privileges
            const { error } = await (supabase
                .from('profiles') as any)
                .update({ role: 'patient', is_super_admin: false })
                .eq('user_id', targetAdminId)
                .eq('role', 'admin');

            if (error) throw error;

            await this.logAdminAction(supabase, adminId, 'revoke_admin' as any, targetAdminId, {});

            endTimer(spanName, 'adminService', { targetAdminId, span_name: spanName });
            return { success: true };
        } catch (error) {
            reportError(error, spanName, { targetAdminId, span_name: spanName, traceId: getTraceId() });
            throw error;
        }
    },

    /**
     * Fetch audit logs
     */
    async getAdminActions(supabase: SupabaseClient<Database>, limit: number = 50) {
        const spanName = 'adminService:getAdminActions';
        startTimer(spanName);
        try {
            const { data, error } = await supabase
                .from('admin_actions')
                .select(`
                    *,
                    admin:admin_id(id, full_name, avatar_url)
                `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            endTimer(spanName, 'adminService', { span_name: spanName });
            return data;
        } catch (error) {
            reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
            throw error;
        }
    },

    /**
     * Log an admin action to the audit trail
     */
    async logAdminAction(
        supabase: SupabaseClient<Database>,
        adminId: string,
        actionType: AdminActionType,
        targetUserId: string | null,
        details: any
    ) {
        const spanName = 'adminService:logAdminAction';
        try {
            const { error } = await (supabase
                .from('admin_actions') as any)
                .insert({
                    admin_id: adminId,
                    action_type: actionType,
                    target_user_id: targetUserId,
                    details
                });

            if (error) throw error;
        } catch (error) {
            reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
            // Don't throw here to avoid failing the main operation if logging fails
        }
    }
};


