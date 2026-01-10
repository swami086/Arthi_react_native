'use server';

import { createClient } from '@/lib/supabase/server';
import { adminService } from '@/lib/services/admin-service';
import { revalidatePath } from 'next/cache';
import { reportError, withRollbarSpan, getTraceId } from '@/lib/rollbar-utils';

/**
 * Verify if the current user is an admin
 */
async function getAdminUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await (supabase
        .from('profiles') as any)
        .select('role, is_super_admin')
        .eq('user_id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') return null;
    return { id: user.id, is_super_admin: profile.is_super_admin };
}

export async function getAdminDashboardData() {
    const spanName = 'adminActions:getAdminDashboardData';
    try {
        const admin = await getAdminUser();
        if (!admin) return { success: false, error: 'Unauthorized' };

        const supabase = await createClient();
        const stats = await adminService.getAdminStats(supabase);

        // Also fetch recent actions for the dashboard using service
        const recentActions = await adminService.getAdminActions(supabase, 5);

        return { success: true, data: { stats, recentActions } };
    } catch (error) {
        reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to fetch dashboard data' };
    }
}

export async function approveMentorAction(mentorId: string, notes?: string) {
    const spanName = 'adminActions:approveMentorAction';
    try {
        const admin = await getAdminUser();
        if (!admin) return { success: false, error: 'Unauthorized' };

        const supabase = await createClient();
        await adminService.approveMentor(supabase, mentorId, admin.id, notes);

        revalidatePath('/admin/pending-approvals');
        revalidatePath('/admin/mentors');
        revalidatePath(`/admin/mentors/${mentorId}/review`);

        return { success: true };
    } catch (error) {
        reportError(error, spanName, { mentorId, span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to approve mentor' };
    }
}

export async function rejectMentorAction(mentorId: string, reason: string) {
    const spanName = 'adminActions:rejectMentorAction';
    try {
        const admin = await getAdminUser();
        if (!admin) return { success: false, error: 'Unauthorized' };

        const supabase = await createClient();
        await adminService.rejectMentor(supabase, mentorId, admin.id, reason);

        revalidatePath('/admin/pending-approvals');
        revalidatePath('/admin/mentors');
        revalidatePath(`/admin/mentors/${mentorId}/review`);

        return { success: true };
    } catch (error) {
        reportError(error, spanName, { mentorId, span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to reject mentor' };
    }
}

export async function createAdminAction(email: string, fullName: string, isSuperAdmin: boolean) {
    const spanName = 'adminActions:createAdminAction';
    try {
        const admin = await getAdminUser();
        if (!admin || !admin.is_super_admin) return { success: false, error: 'Only super admins can create new admins' };

        const supabase = await createClient();
        const result = await adminService.createAdmin(supabase, email, fullName, isSuperAdmin, admin.id);

        revalidatePath('/admin/admins');
        return result;
    } catch (error) {
        reportError(error, spanName, { email, span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to create admin' };
    }
}

export async function revokeAdminAction(targetAdminId: string) {
    const spanName = 'adminActions:revokeAdminAction';
    try {
        const admin = await getAdminUser();
        if (!admin || !admin.is_super_admin) return { success: false, error: 'Only super admins can revoke admin access' };

        const supabase = await createClient();
        await adminService.revokeAdminAccess(supabase, targetAdminId, admin.id);

        revalidatePath('/admin/admins');
        return { success: true };
    } catch (error) {
        reportError(error, spanName, { targetAdminId, span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to revoke admin access' };
    }
}

export async function updateAdminRoleAction(targetAdminId: string, isSuperAdmin: boolean) {
    const spanName = 'adminActions:updateAdminRoleAction';
    try {
        const admin = await getAdminUser();
        if (!admin || !admin.is_super_admin) return { success: false, error: 'Only super admins can update roles' };

        const supabase = await createClient();
        await adminService.updateAdminRole(supabase, targetAdminId, isSuperAdmin, admin.id);

        revalidatePath('/admin/admins');
        return { success: true };
    } catch (error) {
        reportError(error, spanName, { targetAdminId, isSuperAdmin, span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to update admin role' };
    }
}

export async function getAdminActionsAction(limit?: number) {
    const spanName = 'adminActions:getAdminActionsAction';
    try {
        const admin = await getAdminUser();
        if (!admin) return { success: false, error: 'Unauthorized' };

        const supabase = await createClient();
        const data = await adminService.getAdminActions(supabase, limit);
        return { success: true, data };
    } catch (error) {
        reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to fetch audit logs' };
    }
}

export async function getPendingMentorsAction() {
    const spanName = 'adminActions:getPendingMentorsAction';
    try {
        const admin = await getAdminUser();
        if (!admin) return { success: false, error: 'Unauthorized' };

        const supabase = await createClient();
        const data = await adminService.getPendingMentors(supabase);
        return { success: true, data };
    } catch (error) {
        reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to fetch pending mentors' };
    }
}

export async function getAllMentorsAction(status?: string) {
    const spanName = 'adminActions:getAllMentorsAction';
    try {
        const admin = await getAdminUser();
        if (!admin) return { success: false, error: 'Unauthorized' };

        const supabase = await createClient();
        const data = await adminService.getAllMentors(supabase, status);
        return { success: true, data };
    } catch (error) {
        reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to fetch mentors' };
    }
}

export async function getAllMenteesAction() {
    const spanName = 'adminActions:getAllMenteesAction';
    try {
        const admin = await getAdminUser();
        if (!admin) return { success: false, error: 'Unauthorized' };

        const supabase = await createClient();
        const data = await adminService.getAllMentees(supabase);
        return { success: true, data };
    } catch (error) {
        reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to fetch mentees' };
    }
}

export async function getAllAdminsAction() {
    const spanName = 'adminActions:getAllAdminsAction';
    try {
        const admin = await getAdminUser();
        if (!admin) return { success: false, error: 'Unauthorized' };

        const supabase = await createClient();
        const data = await adminService.getAllAdmins(supabase);
        return { success: true, data };
    } catch (error) {
        reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to fetch admins' };
    }
}
