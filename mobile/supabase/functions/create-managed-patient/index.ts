import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { reportError, reportInfo, extractTraceContext } from '../_shared/rollbar.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Create Managed Patient Function Loaded v2")

serve(async (req) => {
    const { traceId, spanId } = extractTraceContext(req);
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json().catch(() => ({}));
        const { therapist_id, email, full_name } = body;

        console.log(`[Request] Adding patient: ${email} for therapist: ${therapist_id}`);

        if (!therapist_id || !email || !full_name) {
            console.error("Missing fields:", body);
            throw new Error('Missing required fields: therapist_id, email, full_name');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const serviceKey = Deno.env.get('SERVICE_ROLE_KEY') ?? '';

        if (!serviceKey || serviceKey.length < 10) {
            console.error("Fatal: SERVICE_ROLE_KEY is missing or invalid");
            throw new Error('Server misconfiguration: Service Role Key missing');
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceKey);

        // 1. Try to create the user
        let userId = null;
        let isNewUser = false;

        console.log("Attempting to invite user via email...");
        const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { full_name: full_name }
        });

        if (createError) {
            console.log("Invite failed, likely exists. Cause:", createError.message);

            // Fallback: Find user by email
            // Note: `listUsers` can be slow/limited but standard listUsers() call without params gets first page (50 users).
            const { data: { users }, error: searchError } = await supabaseAdmin.auth.admin.listUsers({
                perPage: 1000 // naive approach for now
            });

            if (searchError) {
                console.error("List users failed:", searchError);
                throw searchError;
            }

            const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

            if (existingUser) {
                userId = existingUser.id;
                console.log("Found existing user:", userId);
            } else {
                console.error("User creation failed AND user not found in list.");
                throw new Error(`Could not invite or find user: ${createError.message}`);
            }
        } else {
            userId = createdUser.user.id;
            isNewUser = true;
            console.log("User invited successfully:", userId);
        }

        // 2. Upsert Profile
        console.log("Upserting profile...");
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                user_id: userId,
                full_name: full_name,
                role: 'patient',
                is_available: true
            });

        if (profileError) {
            console.error("Profile error:", profileError);
            throw new Error(`Profile update failed: ${profileError.message}`);
        }

        // 3. Create Relationship
        console.log("Creating relationship...");

        // Check if relationship already exists
        const { data: existingRel, error: fetchRelError } = await supabaseAdmin
            .from('therapist_patient_relationships')
            .select('id')
            .eq('therapist_id', therapist_id)
            .eq('patient_id', userId)
            .maybeSingle();

        if (fetchRelError) {
            console.error("Relationship fetch error:", fetchRelError);
            throw new Error(`Failed to check existing relationship: ${fetchRelError.message}`);
        }

        let relError;

        if (existingRel) {
            console.log("Relationship exists, updating to active...");
            const { error } = await supabaseAdmin
                .from('therapist_patient_relationships')
                .update({
                    status: 'active',
                    notes: 'Added manually by therapist (updated)',
                    assigned_by: therapist_id,
                    assigned_date: new Date().toISOString()
                })
                .eq('id', existingRel.id);
            relError = error;
        } else {
            console.log("Creating new relationship...");
            const { error } = await supabaseAdmin
                .from('therapist_patient_relationships')
                .insert({
                    therapist_id: therapist_id,
                    patient_id: userId,
                    status: 'active',
                    notes: 'Added manually by therapist',
                    assigned_by: therapist_id,
                    assigned_date: new Date().toISOString()
                });
            relError = error;
        }

        if (relError) {
            console.error("Relationship error:", relError);
            throw new Error(`Relationship creation/update failed: ${relError.message}`);
        }

        console.log("Success!");
        reportInfo('Managed patient created/linked', 'create-managed-patient', {
            patientId: userId,
            isNew: isNewUser,
            trace_id: traceId,
            span_id: spanId
        });

        return new Response(
            JSON.stringify({
                success: true,
                patient_id: userId,
                is_new_user: isNewUser,
                message: isNewUser ? "User created and added." : "User existed and linked."
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error("Edge Logic Error:", error);
        await reportError(error, 'create-managed-patient', {
            trace_id: traceId,
            span_id: spanId
        });
        // Return 200 with error details so frontend can display the message
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Unknown server error',
                details: JSON.stringify(error)
            }),
            {
                status: 200, // Changed from 400 to 200 to allow client to read body
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
