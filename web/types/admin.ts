import { Database } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AdminStats {
    pending_approvals: number;
    active_therapists: number;
    total_patients: number;
    total_admins: number;
}

export type AdminActionType = 'create_admin' | 'approve_therapist' | 'reject_therapist' | 'assign_patient';

export interface AdminAction {
    id: string;
    admin_id: string;
    action_type: AdminActionType;
    target_user_id: string | null;
    details: any;
    created_at: string;
}
