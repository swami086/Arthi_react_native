
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 1. Load Environment Variables
function loadEnv() {
    try {
        const envPath = path.resolve(rootDir, '.env.local');
        if (!fs.existsSync(envPath)) {
            console.warn("⚠️ .env.local not found at", envPath);
            return process.env;
        }
        const content = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                env[key] = value;
            }
        });
        return env;
    } catch (e) {
        console.warn("⚠️ Error loading .env.local:", e);
        return process.env;
    }
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
}

console.log(`✅ Supabase URL found: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
    console.log('\n--- 🧪 Starting E2E Agent Verification ---\n');

    // 2. Authentication
    const email = 'test.mentor1@gmail.com';
    const password = 'Testing123!';

    console.log(`👤 Signing in test user: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        console.error('❌ Auth SignIn Error:', authError.message);
        return;
    }

    if (!authData.session) {
        console.warn('⚠️ User signed in but NO SESSION returned.');
        return;
    }

    console.log('✅ User authenticated successfully.');
    const token = authData.session.access_token;

    // 3. Test Booking Agent (Specialized Function)
    console.log('\n--- 🏨 Testing Booking Agent Init ---');
    try {
        const { data: bookingData, error: bookingError } = await supabase.functions.invoke('booking-agent-init', {
            headers: { Authorization: `Bearer ${token}` },
            body: { specialization: 'anxiety' }
        });

        if (bookingError) {
            console.error('❌ Booking Agent Init Failed:', bookingError);
            if (bookingError instanceof Error) console.error(bookingError.message);
        } else {
            console.log('✅ Booking Agent Init Success!');
            console.log('   Response:', JSON.stringify(bookingData, null, 2));

            if (bookingData.surfaceId) {
                console.log(`\n--- 🎬 Testing Booking Action (surface: ${bookingData.surfaceId}) ---`);
                const { data: actionData, error: actionError } = await supabase.functions.invoke('booking-agent', {
                    headers: { Authorization: `Bearer ${token}` },
                    body: {
                        action: 'select_therapist',
                        surfaceId: bookingData.surfaceId,
                        payload: { therapistId: 'mock-therapist-id' },
                        metadata: { userMessage: 'I choose Dr. Smith' }
                    }
                });

                if (actionError) {
                    console.error('❌ Booking Action Failed:', actionError);
                } else {
                    console.log('✅ Booking Action Success!');
                    console.log('   Response:', JSON.stringify(actionData, null, 2));
                }
            }
        }
    } catch (err) {
        console.error("❌ Unexpected error calling booking-agent:", err);
    }

    // 4. Test Orchestrator (General Chat)
    console.log('\n--- 🗣️  Testing Agent Orchestrator (General Chat) ---');
    try {
        const { data: chatData, error: chatError } = await supabase.functions.invoke('agent-orchestrator', {
            headers: { Authorization: `Bearer ${token}` },
            body: {
                message: 'Hello, I need help.',
                intent: 'general', // Correct intent name from registry
                conversationId: 'test-conv-123' // valid conversation id if needed, or null to create new
            }
        });

        if (chatError) {
            console.error('❌ Agent Orchestrator Failed:', chatError);
            if (chatError.context && chatError.context.json) {
                try {
                    const errorBody = await chatError.context.json();
                    console.error('❌ Error Body:', JSON.stringify(errorBody, null, 2));
                } catch (e) {
                    console.error('Could not parse error body:', e);
                }
            }
        } else {
            console.log('✅ Agent Orchestrator Success!');
            console.log('   Response:', JSON.stringify(chatData, null, 2));
        }

    } catch (err) {
        console.error("❌ Unexpected error calling agent-orchestrator:", err);
    }

    // 5. Cleanup (Optional - Delete User? Hard without admin key)
    console.log('\n--- 🏁 Verification Complete ---');
}

runTest();
