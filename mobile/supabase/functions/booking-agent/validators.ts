/**
 * Booking Agent Validators
 */

export function validateAction(action: string, payload: any): boolean {
    if (!action) return false;

    switch (action) {
        case 'select_therapist':
            return !!payload.therapistId;
        case 'select_date':
            return !!payload.therapistId && !!payload.date;
        case 'select_time_slot':
            return !!payload.therapistId && !!payload.time && !!payload.date;
        case 'confirm_booking':
            return !!payload.therapistId && !!payload.time && !!payload.date;
        case 'cancel_booking':
            return true;
        default:
            return false;
    }
}

export async function checkPermissions(user: any, action: string, surface: any): Promise<boolean> {
    // Simple check: user must own the surface
    if (surface.user_id !== user.id) return false;

    // Potential: check if user has active subscription or credits
    return true;
}

export function checkRateLimit(userId: string): boolean {
    // In production, use Redis or a similar store
    // For now, allow all (Supabase Edge Functions have their own limits anyway)
    return true;
}
