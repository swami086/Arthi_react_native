import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { addBreadcrumb, reportError, getTraceId } from '@/lib/rollbar-utils';

/**
 * Service for managing platform notifications.
 * Adapted from the React Native implementation for Next.js.
 */
export const NotificationService = {
    /**
     * Create a new notification for a user.
     */
    createNotification: async (
        supabase: SupabaseClient,
        userId: string,
        title: string,
        message: string,
        type: 'appointment' | 'message' | 'system' | 'payment',
        relatedEntityId?: string,
        metadata?: any
    ) => {
        const traceId = getTraceId();
        addBreadcrumb('Creating notification', 'NotificationService.createNotification', 'info', {
            userId,
            type,
            traceId
        });

        try {
            const { error } = await (supabase
                .from('notifications') as any)
                .insert({
                    user_id: userId,
                    title,
                    message,
                    type,
                    related_entity_id: relatedEntityId,
                    metadata,
                    is_read: false,
                });

            if (error) throw error;
            return true;
        } catch (error) {
            reportError(error, 'NotificationService:createNotification', { userId, traceId });
            throw error;
        }
    },

    /**
     * Mark a single notification as read.
     */
    markAsRead: async (supabase: SupabaseClient, id: string) => {
        try {
            const { error } = await (supabase
                .from('notifications') as any)
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            reportError(error, 'NotificationService:markAsRead');
            throw error;
        }
    },

    /**
     * Mark all notifications as read for a user.
     */
    markAllAsRead: async (supabase: SupabaseClient, userId: string) => {
        try {
            const { error } = await (supabase
                .from('notifications') as any)
                .update({ is_read: true })
                .eq('user_id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            reportError(error, 'NotificationService:markAllAsRead');
            throw error;
        }
    },

    /**
     * Delete a notification.
     */
    deleteNotification: async (supabase: SupabaseClient, id: string) => {
        try {
            const { error } = await (supabase
                .from('notifications') as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            reportError(error, 'NotificationService:deleteNotification');
            throw error;
        }
    },

    /**
     * Send slot proposal notifications (email + in-app notification)
     */
    sendSlotProposalNotification: async (
        supabase: SupabaseClient,
        proposalId: string,
        patientId: string,
        therapistId: string
    ) => {
        const traceId = getTraceId();
        addBreadcrumb('Sending slot proposal notification', 'NotificationService.sendSlotProposalNotification', 'info', {
            proposalId,
            patientId,
            therapistId,
            traceId
        });

        try {
            // Fetch proposal details - query separately to avoid PostgREST join issues
            const { data: proposal, error: proposalError } = await (supabase
                .from('slot_proposals') as any)
                .select('*')
                .eq('id', proposalId)
                .single();

            if (proposalError || !proposal) {
                throw new Error('Proposal not found');
            }

            // Fetch patient and therapist profiles separately
            const { data: patientProfile, error: patientError } = await supabase
                .from('profiles')
                .select('user_id, full_name, email, phone_number')
                .eq('user_id', patientId)
                .single();

            const { data: therapistProfile, error: therapistError } = await supabase
                .from('profiles')
                .select('user_id, full_name')
                .eq('user_id', therapistId)
                .single();

            if (patientError || !patientProfile) {
                throw new Error('Patient profile not found');
            }

            if (therapistError || !therapistProfile) {
                throw new Error('Therapist profile not found');
            }

            const bookingLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book?proposal=${proposalId}`;
            const proposedSlots = proposal.proposed_slots || [];
            const therapistName = therapistProfile.full_name || 'Your therapist';
            const patientName = patientProfile.full_name || 'Patient';

            // Send email notification if email is available
            if (patientProfile.email) {
                try {
                    const { sendSlotProposalEmail } = await import('./slot-proposal-email');
                    await sendSlotProposalEmail(
                        patientProfile.email!,
                        patientName,
                        therapistName,
                        proposedSlots,
                        bookingLink
                    );
                    addBreadcrumb('Email notification sent', 'NotificationService.sendSlotProposalNotification:email', 'info', {
                        proposalId,
                        patientEmail: patientProfile.email,
                        traceId
                    });
                } catch (emailError) {
                    reportError(emailError, 'NotificationService:sendSlotProposalNotification:email', { proposalId, traceId });
                    // Continue with other notifications even if email fails
                }
            }

            // Send WhatsApp notification if phone number is available
            if (patientProfile.phone_number) {
                try {
                    const { data: whatsappData, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-message', {
                        body: {
                            to: patientProfile.phone_number,
                            message: `${therapistName} has proposed ${proposedSlots.length} time slot${proposedSlots.length > 1 ? 's' : ''} for your session. View and book: ${bookingLink}`,
                        },
                    });

                    if (whatsappError) {
                        reportError(whatsappError, 'NotificationService:sendSlotProposalNotification:whatsapp', { proposalId, traceId });
                    } else {
                        addBreadcrumb('WhatsApp notification sent', 'NotificationService.sendSlotProposalNotification:whatsapp', 'info', {
                            proposalId,
                            phoneNumber: patientProfile.phone_number,
                            traceId
                        });
                    }
                } catch (whatsappError) {
                    reportError(whatsappError, 'NotificationService:sendSlotProposalNotification:whatsapp', { proposalId, traceId });
                    // Continue even if WhatsApp fails
                }
            }

            // Create in-app notification
            await NotificationService.createNotification(
                supabase,
                patientId,
                'New Session Proposal',
                `${therapistName} has proposed ${proposedSlots.length} time slot${proposedSlots.length > 1 ? 's' : ''} for your session.`,
                'appointment',
                proposalId,
                { type: 'slot_proposal', proposal_id: proposalId }
            );

            addBreadcrumb('Slot proposal notification sent', 'NotificationService.sendSlotProposalNotification:success', 'info', {
                proposalId,
                emailSent: !!patientProfile.email,
                whatsappSent: !!patientProfile.phone_number,
                traceId
            });

            return { 
                success: true,
                emailSent: !!patientProfile.email,
                whatsappSent: !!patientProfile.phone_number,
            };
        } catch (error) {
            reportError(error, 'NotificationService:sendSlotProposalNotification', { proposalId, traceId });
            throw error;
        }
    }
};
