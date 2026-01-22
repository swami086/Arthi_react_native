
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pqjwldzyogmdangllnlr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxandsZHp5b2dtZGFuZ2xsbmxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODEyODcsImV4cCI6MjA4MTI1NzI4N30.PviOVpjA5WQVAHxcKGL0TsPJ67TYUa4ifT-9EE-tmII';

const APPOINTMENT_ID = 'ea94f829-4cd6-45f4-84fc-1a1d45764fad';
const THERAPIST_ID = 'ed10bdbd-9a4e-4fa9-87a7-43e0e6163e72';
const SURFACE_ID = `session-copilot-${APPOINTMENT_ID}`;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
    console.log(`🚀 Starting A2UI Realtime Simulation (UPSERT)...`);

    // 1. Upsert Database (Persistence)
    console.log('💾 Upserting database surface record...');
    const payload = {
        components: [
            {
                id: `risk-${Date.now()}`,
                type: 'RiskAlert',
                props: {
                    type: 'self-harm',
                    severity: 'critical',
                    description: '🚨 REAL-TIME TEST: Elevated risk levels detected. (Persisted via Upsert)',
                    detectedAt: new Date().toISOString(),
                    onOpenAssessment: 'open_hopelessness_assessment',
                    onFlagForReview: 'flag_risk_high'
                }
            }
        ],
        dataModel: { isLive: true }
    };

    const { error } = await supabase
        .from('a2ui_surfaces')
        .upsert({
            surface_id: SURFACE_ID,
            user_id: THERAPIST_ID,
            agent_id: 'session-agent',
            components: payload.components,
            data_model: payload.dataModel,
            version: 1,
            updated_at: new Date().toISOString()
        }, { onConflict: 'surface_id' });

    if (error) {
        console.error('❌ DB Upsert failed:', error);
    } else {
        console.log('✅ DB Upsert successful');
    }

    // 2. Broadcast
    const channel = supabase.channel(`a2ui:${THERAPIST_ID}`);
    await new Promise((resolve) => {
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Subscribed to Realtime channel');
                const result = await channel.send({
                    type: 'broadcast',
                    event: 'surfaceUpdate',
                    payload: {
                        type: 'surfaceUpdate',
                        operation: 'update',
                        surfaceId: SURFACE_ID,
                        userId: THERAPIST_ID,
                        agentId: 'session-agent',
                        components: payload.components,
                        timestamp: new Date().toISOString()
                    }
                });
                console.log(`📊 Broadcast status: ${result}`);
                resolve(true);
            }
        });
    });

    console.log('🏁 Simulation complete.');
    process.exit(0);
}

runTest().catch(console.error);
