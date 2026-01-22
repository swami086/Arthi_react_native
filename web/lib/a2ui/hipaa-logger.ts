
import { createClient } from '@/lib/supabase/client';
import { A2UIAction, SurfaceUpdateMessage } from './types';

// ============================================================================
// HIPAA Logging
// ============================================================================

interface HIPAALogEntry {
    timestamp: string;
    eventType: 'component_render' | 'user_action' | 'data_access' | 'surface_update' | 'security_violation';
    userId: string;
    surfaceId?: string;
    agentId?: string;
    details: any;
    sessionId: string;
}

/**
 * HIPAALogger provides auditing for all A2UI interactions that may involve PHI.
 * It logs events to Supabase to ensure a complete audit trail for compliance.
 */
class HIPAALogger {
    private sessionId: string;

    constructor() {
        this.sessionId = crypto.randomUUID();
    }

    /**
     * Internal method to persist log entries to the database.
     */
    private async logToSupabase(entry: HIPAALogEntry) {
        try {
            const supabase = createClient();
            const { error } = await supabase.from('a2ui_audit_logs').insert({
                timestamp: entry.timestamp,
                event_type: entry.eventType,
                user_id: entry.userId,
                surface_id: entry.surfaceId,
                agent_id: entry.agentId,
                details: entry.details,
                session_id: entry.sessionId,
            });

            if (error) {
                console.error('[HIPAA Logger] Failed to log:', error);
            }
        } catch (e) {
            console.error('[HIPAA Logger] Log failure:', e);
        }
    }

    /**
     * Logs the rendering of an A2UI component.
     * 
     * @param surfaceId - The ID of the parent surface
     * @param componentType - The type of component being rendered
     * @param userId - The ID of the user viewing the component
     */
    logComponentRender(surfaceId: string, componentType: string, userId: string) {
        const entry: HIPAALogEntry = {
            timestamp: new Date().toISOString(),
            eventType: 'component_render',
            userId,
            surfaceId,
            details: { componentType },
            sessionId: this.sessionId,
        };
        this.logToSupabase(entry);
    }

    /**
     * Logs access to a data point in the A2UI Data Model.
     * 
     * @param surfaceId - The surface ID
     * @param dataPath - The JSON Pointer path accessed
     * @param userId - The user ID performing the access
     */
    logDataAccess(surfaceId: string, dataPath: string, userId: string): void {
        const entry: HIPAALogEntry = {
            timestamp: new Date().toISOString(),
            eventType: 'data_access',
            userId,
            surfaceId,
            details: { dataPath },
            sessionId: this.sessionId,
        };
        this.logToSupabase(entry);
    }

    /**
     * Logs a user interaction (action) with an A2UI component.
     * 
     * @param action - The action object received from the UI
     * @param userId - The user ID who initiated the action
     */
    logUserAction(action: A2UIAction, userId: string) {
        const entry: HIPAALogEntry = {
            timestamp: new Date().toISOString(),
            eventType: 'user_action',
            userId,
            surfaceId: action.surfaceId,
            details: {
                actionId: action.actionId,
                actionType: action.type,
            },
            sessionId: this.sessionId,
        };
        this.logToSupabase(entry);
    }

    /**
     * Logs a surface update received from an agent.
     * 
     * @param message - The surface update message
     */
    logSurfaceUpdate(message: SurfaceUpdateMessage) {
        const entry: HIPAALogEntry = {
            timestamp: new Date().toISOString(),
            eventType: 'surface_update',
            userId: message.userId,
            surfaceId: message.surfaceId,
            agentId: message.agentId,
            details: {
                operation: message.operation,
                componentCount: message.components?.length
            },
            sessionId: this.sessionId,
        };
        this.logToSupabase(entry);
    }

    /**
     * Logs security violations (e.g., failed validation, suspicious patterns).
     * 
     * @param violation - A string describing the violation type
     * @param context - Additional debugging context
     */
    logSecurityViolation(violation: string, context: any) {
        const entry: HIPAALogEntry = {
            timestamp: new Date().toISOString(),
            eventType: 'security_violation',
            userId: context.userId || 'unknown',
            surfaceId: context.surfaceId,
            details: { violation, context },
            sessionId: this.sessionId,
        };
        this.logToSupabase(entry);
    }
}

export const hipaaLogger = new HIPAALogger();
