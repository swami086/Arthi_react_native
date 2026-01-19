import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';
import * as tools from './tools.ts';
import * as builder from './surface-builder.ts';

/**
 * Booking Agent main entry point.
 * Handles A2UI actions and manages the booking conversation flow.
 */
serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Initialize Supabase Client with User context
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

        // Authenticate user
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Missing Authorization header');
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) throw new Error('Unauthorized');

        // 2. Parse Request
        const body = await req.json();
        const { action, surfaceId, payload } = body;

        if (!surfaceId) throw new Error('Missing surfaceId');

        // 3. Fetch Surface State
        const { data: surface, error: surfaceError } = await supabaseClient
            .from('a2ui_surfaces')
            .select('*')
            .eq('surface_id', surfaceId)
            .eq('user_id', user.id)
            .single();

        if (surfaceError || !surface) throw new Error('Surface not found or access denied');

        let updatedComponents = surface.components;
        let updatedMetadata = surface.metadata || {};
        let textResponse = "";

        // 4. Handle Actions
        switch (action) {
            case 'select_therapist': {
                const { therapistId } = payload;
                const { data: therapist } = await supabaseClient.from('profiles').select('*').eq('user_id', therapistId).single();
                if (!therapist) throw new Error('Therapist not found');

                const today = new Date().toISOString().split('T')[0];
                const slots = await tools.getAvailableTimeSlots(therapistId, today);

                updatedComponents = builder.buildDateTimeSurface(therapist, today, slots);
                updatedMetadata = { ...updatedMetadata, selectedTherapistId: therapistId, selectedDate: today, step: 'DATE_TIME_SELECTION' };
                textResponse = `Chosen therapist: **${therapist.full_name}**. When would you like to schedule your session? I've loaded available slots for today.`;
                break;
            }

            case 'select_date': {
                const { date, therapistId } = payload;
                const { data: therapist } = await supabaseClient.from('profiles').select('*').eq('user_id', therapistId).single();
                const slots = await tools.getAvailableTimeSlots(therapistId, date);

                updatedComponents = builder.buildDateTimeSurface(therapist, date, slots);
                updatedMetadata = { ...updatedMetadata, selectedDate: date };
                textResponse = `Showing availability for **${date}**. Does any of these slots work for you?`;
                break;
            }

            case 'select_time_slot': {
                const { therapistId, time, endTime, date } = payload;
                const { data: therapist } = await supabaseClient.from('profiles').select('*').eq('user_id', therapistId).single();

                updatedComponents = builder.buildConfirmationSurface(therapist, { date, time, endTime });
                updatedMetadata = { ...updatedMetadata, selectedTime: time, selectedEndTime: endTime, step: 'CONFIRMATION' };
                textResponse = `Perfect. You've selected **${time}** on **${date}**. Shall I go ahead and book this for you?`;
                break;
            }

            case 'confirm_booking': {
                const { therapistId, time, endTime, date } = payload;
                const appointment = await tools.createAppointment(user.id, {
                    therapistId,
                    date,
                    time,
                    endTime,
                    price: 1500,
                    notes: updatedMetadata.notes || 'Booked via BookingAgent'
                });

                updatedComponents = builder.buildSuccessSurface(appointment);
                updatedMetadata = { ...updatedMetadata, appointmentId: appointment.id, step: 'COMPLETED' };
                textResponse = `Success! Your session with **${appointment.therapist.full_name}** is confirmed. You can join the session using the link in the card below.`;
                break;
            }

            case 'cancel_booking': {
                // Reset to therapist selection
                const therapists = await tools.searchTherapists();
                updatedComponents = builder.buildTherapistSelectionSurface(therapists);
                updatedMetadata = { step: 'THERAPIST_SELECTION' };
                textResponse = "No problem. Let's start over. Here are some of our top-rated therapists.";
                break;
            }

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        // 5. Persist Updates
        const { error: updateError } = await supabaseClient
            .from('a2ui_surfaces')
            .update({
                components: updatedComponents,
                metadata: updatedMetadata,
                version: (surface.version || 1) + 1,
                updated_at: new Date().toISOString()
            })
            .eq('surface_id', surfaceId);

        if (updateError) throw updateError;

        // 6. Broadcast Update to User's Channel
        const channel = supabaseClient.channel(`a2ui:${user.id}`);
        await new Promise((resolve) => {
            channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.send({
                        type: 'broadcast',
                        event: 'surfaceUpdate',
                        payload: {
                            type: 'surfaceUpdate',
                            operation: 'update',
                            surfaceId: surfaceId,
                            userId: user.id,
                            agentId: 'booking-agent',
                            components: updatedComponents,
                            metadata: updatedMetadata,
                            timestamp: new Date().toISOString()
                        }
                    });
                    resolve(true);
                }
            });
        });
        await supabaseClient.removeChannel(channel);

        // 7. Log Action
        await supabaseClient
            .from('a2ui_actions')
            .insert({
                surface_id: surfaceId,
                user_id: user.id,
                action_id: `act_${Date.now()}`,
                action_type: action,
                payload: payload,
                metadata: { agent: 'booking-agent' }
            });

        // 7. Return Response
        return new Response(JSON.stringify({
            success: true,
            textResponse,
            surface: {
                ...surface,
                components: updatedComponents,
                metadata: updatedMetadata,
                version: (surface.version || 1) + 1
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('BookingAgent Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
