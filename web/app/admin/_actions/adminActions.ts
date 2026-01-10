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

export async function approveTherapistAction(therapistId: string, notes?: string) {
    const spanName = 'adminActions:approveTherapistAction';
    try {
        const admin = await getAdminUser();
        if (!admin) return { success: false, error: 'Unauthorized' };

        const supabase = await createClient();
        await adminService.approveTherapist(supabase, therapistId, admin.id, notes);

        revalidatePath('/admin/pending-approvals');
        revalidatePath('/admin/therapists');
        revalidatePath(`/admin/therapists/${therapistId}/review`);

        return { success: true };
    } catch (error) {
        reportError(error, spanName, { therapistId, span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to approve therapist' };
    }
}

export async function rejectTherapistAction(therapistId: string, reason: string) {
    const spanName = 'adminActions:rejectTherapistAction';
    try {
        const admin = await getAdminUser();
        if (!admin) return { success: false, error: 'Unauthorized' };

        const supabase = await createClient();
        await adminService.rejectTherapist(supabase, therapistId, admin.id, reason);

        revalidatePath('/admin/pending-approvals');
        revalidatePath('/admin/therapists');
        revalidatePath(`/admin/therapists/${therapistId}/review`);

        return { success: true };
    } catch (error) {
        reportError(error, spanName, { therapistId, span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to reject therapist' };
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

export async function getPendingTherapistsAction() {
    const spanName = 'adminActions:getPendingTherapistsAction';
    try {
        const admin = await getAdminUser();
        if (!admin) return { success: false, error: 'Unauthorized' };

        const supabase = await createClient();
        const data = await adminService.getPendingTherapists(supabase);
        return { success: true, data };
    } catch (error) {
        reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to fetch pending therapists' };
    }
}

export async function getAllTherapistsAction(status?: string) {
    const spanName = 'adminActions:getAllTherapistsAction';
    try {
        const admin = await getAdminUser();
        if (!admin) return { success: false, error: 'Unauthorized' };

        const supabase = await createClient();
        const data = await adminService.getAllTherapists(supabase, status);
        return { success: true, data };
    } catch (error) {
        reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to fetch therapists' };
    }
}

export async function getAllPatientsAction() {
    const spanName = 'adminActions:getAllPatientsAction';
    try {
        const admin = await getAdminUser();
        if (!admin) return { success: false, error: 'Unauthorized' };

        const supabase = await createClient();
        const data = await adminService.getAllPatients(supabase);
        return { success: true, data };
    } catch (error) {
        reportError(error, spanName, { span_name: spanName, traceId: getTraceId() });
        return { success: false, error: 'Failed to fetch patients' };
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
