# TherapyFlow AI + BioSync - User Stories

## Phase 1: MVP (Ambient Scribe + Basic Scheduling) - 2 Weeks

**Goal:** Therapist can schedule sessions, record audio, get AI-generated notes draft, approve (HITL), and persist.

### Backend User Stories

#### BE-1: Setup Supabase Project & Schema
- **Assigned Engineer:** Backend Engineer
- **Effort:** Small (1 day)
- **Dependencies:** None
- **Acceptance Criteria:**
  - [ ] Supabase project created (AWS Mumbai region)
  - [ ] Core tables created: `profiles`, `patients`, `sessions`, `payments`, `audit_logs`
  - [ ] RLS enabled on all tables
  - [ ] Migrations committed to `supabase/migrations/`
- **Technical Details:**
  ```bash
  supabase init
  supabase start
  # Create migration files
  supabase migration new initial_schema
  # Apply migrations
  supabase db push
  ```
- **Testing:** Run `supabase db reset` to verify migrations work

---

#### BE-2: Implement Supabase Auth for Therapists
- **Assigned Engineer:** Backend Engineer
- **Effort:** Medium (2 days)
- **Dependencies:** BE-1
- **Acceptance Criteria:**
  - [ ] Email/password authentication enabled
  - [ ] Custom claims for roles: `therapist_solo`, `therapist_group`
  - [ ] Auth hooks create profile on signup
  - [ ] JWT tokens include `role` claim
- **Technical Details:**
  - Use Supabase Auth UI or custom Edge Function
  - Database trigger: `ON INSERT auth.users → INSERT profiles`
  - Test with multiple roles
- **Testing:** Create test users, verify JWT claims

---

#### BE-3: Edge Function for Audio Upload
- **Assigned Engineer:** Backend Engineer
- **Effort:** Small (1 day)
- **Dependencies:** BE-1
- **Acceptance Criteria:**
  - [ ] Edge Function `upload-audio` accepts multipart/form-data
  - [ ] Stores audio in Supabase Storage bucket `session-recordings`
  - [ ] Returns signed URL
  - [ ] Rollbar logs upload success/failure
- **Technical Details:**
  ```typescript
  // supabase/functions/upload-audio/index.ts
  import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
  import { createClient } from 'jsr:@supabase/supabase-js@2';
  import { logError } from '../_shared/rollbar.ts';

  serve(async (req) => {
    try {
      const formData = await req.formData();
      const file = formData.get('audio') as File;
      const sessionId = formData.get('session_id') as string;

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const { data, error } = await supabase.storage
        .from('session-recordings')
        .upload(`${sessionId}/${file.name}`, file);

      if (error) throw error;

      return new Response(JSON.stringify({ audio_url: data.path }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      logError(error, { function: 'upload-audio' });
      return new Response(JSON.stringify({ error: 'Upload failed' }), {
        status: 500,
      });
    }
  });
  ```
- **Testing:** Upload test audio file, verify Storage bucket

---

#### BE-4: Scribe Agent Edge Function
- **Assigned Engineer:** Backend Engineer
- **Effort:** Large (3 days)
- **Dependencies:** BE-3, OpenAI API keys
- **Acceptance Criteria:**
  - [ ] Edge Function `scribe-process` accepts `{session_id, audio_url}`
  - [ ] Calls OpenAI Whisper API for transcription (Hinglish support)
  - [ ] Calls GPT-4o with system prompt for SOAP/DAP note generation
  - [ ] Detects self-harm mentions → sets `red_alert: true`
  - [ ] Stores draft notes in `sessions.notes_draft` (HITL pending)
  - [ ] PII masked before sending to OpenAI
  - [ ] Rollbar logs AI call duration, token usage
- **Technical Details:**
  ```typescript
  // supabase/functions/scribe-process/index.ts
  import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
  import { createClient } from 'jsr:@supabase/supabase-js@2';
  import OpenAI from 'npm:openai@4';
  import { maskPII } from '../_shared/pii-mask.ts';
  import { logError, logInfo } from '../_shared/rollbar.ts';

  const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

  serve(async (req) => {
    try {
      const { session_id, audio_url } = await req.json();
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // 1. Download audio from Storage
      const { data: audioBlob } = await supabase.storage
        .from('session-recordings')
        .download(audio_url);

      // 2. Whisper transcription
      const transcription = await openai.audio.transcriptions.create({
        file: audioBlob,
        model: 'gpt-4o-transcribe',
        language: 'hi', // Hinglish
      });

      const transcript = transcription.text;

      // 3. Mask PII
      const maskedTranscript = maskPII(transcript);

      // 4. GPT-4o SOAP note generation
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert clinical scribe for an Indian psychologist. Generate a SOAP note from the session transcript. Use culturally appropriate terms (e.g., "exam pressure"). CRITICAL: If any mention of self-harm exists, add "RED ALERT: Self-harm mentioned" at the top.`,
          },
          {
            role: 'user',
            content: `Transcript: ${maskedTranscript}`,
          },
        ],
      });

      const draftNotes = completion.choices[0].message.content;
      const redAlert = draftNotes.includes('RED ALERT');

      // 5. Store draft
      await supabase
        .from('sessions')
        .update({
          transcript,
          notes_draft: { content: draftNotes },
          red_alert: redAlert,
        })
        .eq('id', session_id);

      logInfo('Scribe processing complete', { session_id, red_alert });

      return new Response(
        JSON.stringify({ draft_notes: draftNotes, red_alert: redAlert }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      logError(error, { function: 'scribe-process' });
      return new Response(JSON.stringify({ error: 'Processing failed' }), {
        status: 500,
      });
    }
  });
  ```
- **Testing:** Mock OpenAI responses, test with sample audio

---

#### BE-5: Basic Scheduling Edge Functions
- **Assigned Engineer:** Backend Engineer
- **Effort:** Medium (2 days)
- **Dependencies:** BE-2
- **Acceptance Criteria:**
  - [ ] `schedule-create`: Create session with collision detection
  - [ ] `schedule-update`: Update session status/time
  - [ ] `schedule-list`: List sessions for therapist (RLS enforced)
  - [ ] Rollbar logs all operations
- **Technical Details:**
  - Use Supabase client with RLS (therapist_id from JWT)
  - Collision detection: Check overlapping `scheduled_at` + `duration`
- **Testing:** Create overlapping sessions, verify conflicts

---

#### BE-6: Realtime Subscriptions for Sessions
- **Assigned Engineer:** Backend Engineer
- **Effort:** Small (1 day)
- **Dependencies:** BE-5
- **Acceptance Criteria:**
  - [ ] Realtime channel `sessions:therapist_id` broadcasts session updates
  - [ ] Frontend can subscribe to live status changes
- **Technical Details:**
  - Enable Realtime on `sessions` table in Supabase dashboard
  - Test with Supabase Studio Realtime inspector
- **Testing:** Update session, verify Realtime event

---

#### BE-7: Rollbar Instrumentation in Edge Functions
- **Assigned Engineer:** Backend Engineer
- **Effort:** Small (1 day)
- **Dependencies:** All BE functions
- **Acceptance Criteria:**
  - [ ] Rollbar Deno SDK integrated in `_shared/rollbar.ts`
  - [ ] All Edge Functions use `logError` and `logInfo`
  - [ ] Rollbar dashboard shows errors with context (session_id, user_id)
- **Technical Details:**
  ```typescript
  // supabase/functions/_shared/rollbar.ts
  import Rollbar from 'npm:rollbar@2';

  const rollbar = new Rollbar({
    accessToken: Deno.env.get('ROLLBAR_ACCESS_TOKEN'),
    environment: Deno.env.get('ENVIRONMENT') || 'development',
  });

  export function logError(error: Error, context: Record<string, any>) {
    rollbar.error(error, { custom: context });
  }

  export function logInfo(message: string, context: Record<string, any>) {
    rollbar.info(message, { custom: context });
  }
  ```
- **Testing:** Trigger error, verify Rollbar dashboard

---

#### BE-8: RLS Policies for Therapist-Patient Isolation
- **Assigned Engineer:** Backend Engineer
- **Effort:** Medium (2 days)
- **Dependencies:** BE-1
- **Acceptance Criteria:**
  - [ ] Therapists can only view/edit their own patients/sessions
  - [ ] Group admins can view practice patients (Phase 3 prep)
  - [ ] Patients cannot access therapist data
  - [ ] Test with multiple therapist accounts
- **Technical Details:**
  - Use `auth.uid()` in policies. See Technical Architecture for specific SQL.
- **Testing:** Create test therapists, verify data isolation

---

### Frontend User Stories

#### FE-1: Setup Next.js 16 Project
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Small (1 day)
- **Dependencies:** None
- **Acceptance Criteria:**
  - [ ] Next.js 16 project created with App Router
  - [ ] Tailwind CSS configured
  - [ ] shadcn/ui components installed
  - [ ] Netlify deployment configured
  - [ ] Local dev server runs on `localhost:3000`
- **Technical Details:**
  ```bash
  npx create-next-app@16 therapyflow-frontend --typescript --tailwind --app
  cd therapyflow-frontend
  npx shadcn-ui@latest init
  # Add Netlify config
  echo "build: npm run build\npublish: .next" > netlify.toml
  ```
- **Testing:** Run `npm run dev`, verify Tailwind works

---

#### FE-2: Therapist Dashboard Layout
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Medium (2 days)
- **Dependencies:** FE-1
- **Acceptance Criteria:**
  - [ ] Dashboard layout with sidebar navigation (Server Component)
  - [ ] Header with user profile dropdown
  - [ ] Responsive design (mobile-first)
  - [ ] Routes: `/dashboard`, `/scheduling`, `/sessions`, `/settings`
- **Technical Details:**
  ```tsx
  // app/(dashboard)/layout.tsx
  import { createServerClient } from '@/lib/supabase/server';
  import { redirect } from 'next/navigation';
  import Sidebar from '@/components/dashboard/sidebar';

  export default async function DashboardLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      redirect('/login');
    }

    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    );
  }
  ```
- **Testing:** Navigate routes, verify auth redirect

---

#### FE-3: Auth Pages (Login/Signup)
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Medium (2 days)
- **Dependencies:** FE-1, BE-2
- **Acceptance Criteria:**
  - [ ] Login page with email/password form
  - [ ] Signup page with role selection (therapist_solo/therapist_group)
  - [ ] Supabase Auth integration
  - [ ] Error handling (invalid credentials)
  - [ ] Redirect to dashboard on success
- **Technical Details:**
  ```tsx
  // app/(auth)/login/page.tsx
  'use client';
  import { useState } from 'react';
  import { createBrowserClient } from '@/lib/supabase/client';
  import { useRouter } from 'next/navigation';

  export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const supabase = createBrowserClient();

    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        alert(error.message);
      } else {
        router.push('/dashboard');
      }
    };

    return (
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    );
  }
  ```
- **Testing:** Login with test user, verify JWT token

---

#### FE-4: Scheduling UI (Calendar View)
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Large (3 days)
- **Dependencies:** FE-2, BE-5
- **Acceptance Criteria:**
  - [ ] Calendar view (FullCalendar or react-big-calendar)
  - [ ] Create session modal (patient select, date/time picker)
  - [ ] TanStack Query for data fetching/mutations
  - [ ] Optimistic updates for session creation
  - [ ] Conflict detection (show error if overlapping)
- **Technical Details:**
  ```tsx
  // app/(dashboard)/scheduling/page.tsx
  'use client';
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { createBrowserClient } from '@/lib/supabase/client';
  import FullCalendar from '@fullcalendar/react';
  import dayGridPlugin from '@fullcalendar/daygrid';

  export default function SchedulingPage() {
    const supabase = createBrowserClient();
    const queryClient = useQueryClient();

    const { data: sessions } = useQuery({
      queryKey: ['sessions'],
      queryFn: async () => {
        const { data } = await supabase
          .from('sessions')
          .select('*, patient:patients(name)')
          .order('scheduled_at', { ascending: true });
        return data;
      },
    });

    const createSession = useMutation({
      mutationFn: async (newSession) => {
        const { data } = await supabase.functions.invoke('schedule-create', {
          body: newSession,
        });
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
      },
    });

    return (
      <div>
        <h1>Scheduling</h1>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={sessions?.map((s) => ({
            title: s.patient.name,
            start: s.scheduled_at,
          }))}
        />
        {/* Create session modal */}
      </div>
    );
  }
  ```
- **Testing:** Create session, verify calendar updates

---

#### FE-5: Session Recording UI
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Medium (2 days)
- **Dependencies:** FE-4, BE-3
- **Acceptance Criteria:**
  - [ ] Record button starts MediaRecorder
  - [ ] Real-time audio waveform visualization
  - [ ] Stop button uploads audio to BE
  - [ ] Loading state during upload
  - [ ] Error handling (mic permission denied)
- **Technical Details:**
  ```tsx
  // app/(dashboard)/sessions/new/page.tsx
  'use client';
  import { useState, useRef } ref from 'react';
  import { createBrowserClient } from '@/lib/supabase/client';

  export default function RecordSessionPage() {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const supabase = createBrowserClient();

    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('session_id', 'session-123'); // Replace with actual ID

        const { data } = await supabase.functions.invoke('upload-audio', {
          body: formData,
        });
        console.log('Uploaded:', data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    };

    const stopRecording = () => {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    };

    return (
      <div>
        <h1>Record Session</h1>
        {!isRecording ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
      </div>
    );
  }
  ```
- **Testing:** Record audio, verify upload

---

#### FE-6: Scribe Review UI (HITL)
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Large (3 days)
- **Dependencies:** FE-5, BE-4
- **Acceptance Criteria:**
  - [ ] Display draft notes from Scribe Agent
  - [ ] Editable text area (React Hook Form)
  - [ ] "Approve" button persists final notes
  - [ ] Link to source transcript for verification
  - [ ] Red alert banner if self-harm detected
  - [ ] Rollbar logs approval action
- **Technical Details:**
  ```tsx
  // app/(dashboard)/sessions/[id]/scribe/page.tsx
  ... (standard React Hook Form + Mutation pattern) ...
  ```
- **Testing:** Edit notes, approve, verify persistence

---

#### FE-7: Realtime Updates in Dashboard
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Small (1 day)
- **Dependencies:** FE-4, BE-6
- **Acceptance Criteria:**
  - [ ] Subscribe to Realtime channel `sessions:therapist_id`
  - [ ] Live updates for session status changes
  - [ ] Toast notifications for new sessions
- **Technical Details:**
  - Use Zustand or React Context to manage live session state.
- **Testing:** Update session in Supabase Studio, verify live update

---

#### FE-8: Rollbar Browser SDK Integration
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Small (1 day)
- **Dependencies:** All FE
- **Acceptance Criteria:**
  - [ ] Rollbar Browser SDK integrated in root layout
  - [ ] Captures uncaught errors
  - [ ] User context (therapist_id) attached
- **Technical Details:**
  - Standard Rollbar setup for Next.js.
- **Testing:** Trigger error, verify Rollbar dashboard

---

## Phase 2: BioSync Integration + WhatsApp Bots - 3 Weeks

**Goal:** Therapist sees wearable alerts pre-session, WhatsApp automates reminders/payments, full happy path workflow.

### Backend User Stories

#### BE-9: BioSync Agent Edge Function
- **Assigned Engineer:** Backend Engineer
- **Effort:** Large (4 days)
- **Dependencies:** BE-1, OpenAI keys, Google Health Connect webhook setup
- **Acceptance Criteria:**
  - [ ] Edge Function `biosync-analyze` receives Health Connect webhook
  - [ ] Stores bio-data in `bio_data` table with consent check
  - [ ] Generates vector embedding for RAG analysis
  - [ ] Calls GPT-4o with historical trends for intelligence brief
  - [ ] Creates alerts for HRV drops, sleep issues
- **Technical Details:**
  - Use OpenAI embeddings API for vector generation.
  - Query pgvector for similarly identified historical patterns.
- **Testing:** Mock webhook, verify alerts created

---

#### BE-10: WhatsApp Business Cloud API Edge Function
- **Assigned Engineer:** Backend Engineer
- **Effort:** Large (4 days)
- **Dependencies:** BE-2, Meta developer account
- **Acceptance Criteria:**
  - [ ] `whatsapp-inbound`: Webhook handler for incoming messages
  - [ ] Growth Agent triages inquiries → schedules appointment
  - [ ] `whatsapp-outbound`: Send reminders, payment links
- **Technical Details:**
  - Meta Cloud API: `POST /v18.0/{phone_number_id}/messages`
- **Testing:** Send test message, verify webhook

---

#### BE-11: UPI Payment Integration
- **Assigned Engineer:** Backend Engineer
- **Effort:** Medium (3 days)
- **Dependencies:** BE-10, Razorpay account
- **Acceptance Criteria:**
  - [ ] Edge Function `payments-upi` generates Razorpay payment link
  - [ ] Sends link via WhatsApp post-session
  - [ ] Webhook handler for payment success updates `payments` table
- **Testing:** Generate link, verify WhatsApp delivery

---

#### BE-12: RAG Setup (ICD-10 + Mental Health Act)
- **Assigned Engineer:** Backend Engineer
- **Effort:** Medium (3 days)
- **Dependencies:** BE-4, BE-9
- **Acceptance Criteria:**
  - [ ] ICD-10 codes ingested into pgvector
  - [ ] Mental Healthcare Act 2017 guidelines embedded
- **Technical Details:**
  - Use `knowledge_base` table with vector column.
- **Testing:** Query RAG, verify relevant results

---

#### BE-13: Extend RLS for Bio-Data Consent
- **Assigned Engineer:** Backend Engineer
- **Effort:** Small (1 day)
- **Acceptance Criteria:**
  - [ ] RLS policy: Therapists view bio-data only with `consent_given = true`
- **Testing:** Revoke consent, verify isolation

---

#### BE-14: Rollbar Context Enhancement
- **Assigned Engineer:** Backend Engineer
- **Effort:** Small (1 day)
- **Acceptance Criteria:**
  - [ ] Rollbar logs include `user_id`, `session_id`, `agent_type`
- **Testing:** Verify logs in Rollbar

---

### Frontend User Stories

#### FE-9: BioSync Dashboard
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Large (4 days)
- **Acceptance Criteria:**
  - [ ] Pre-session intelligence briefs displayed
  - [ ] HRV/sleep/activity charts (Recharts)
  - [ ] Alert cards with severity indicators
- **Technical Details:**
  - Chart components using `Recharts`.
- **Testing:** View charts with sample data

---

#### FE-10: WhatsApp Integration UI
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Medium (3 days)
- **Acceptance Criteria:**
  - [ ] Connect WhatsApp phone number UI
  - [ ] Send manual reminders
- **Testing:** Verify delivery from UI

---

#### FE-11: Patient Consent UI for BioSync
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Small (1 day)
- **Acceptance Criteria:**
  - [ ] Consent toggle for bio-data sharing
- **Testing:** Toggle and check DB

---

#### FE-12: Enhanced Session Workflow
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Medium (3 days)
- **Acceptance Criteria:**
  - [ ] Pre-session alerts -> Record -> Review -> Payments.
- **Testing:** Happy path from start to end

---

#### FE-13: Real-time BioSync Alerts
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Small (1 day)
- **Acceptance Criteria:**
  - [ ] Toast notifications for new alerts
- **Testing:** Trigger alert and verify toast

---

## Phase 3: ABDM Certification + EAP Partnerships - 4 Weeks

**Goal:** ABDM certified (M1/M2/M3), group practice features, EAP ROI dashboard.

### Backend User Stories

#### BE-15: Compliance Agent Edge Function (ABDM)
- **Assigned Engineer:** Backend Engineer
- **Effort:** Large (5 days)
- **Dependencies:** BE-2, ABDM sandbox certification
- **Acceptance Criteria:**
  - [ ] Edge Function `compliance-abha` creates/links ABHA ID
  - [ ] Supports Aadhaar and OTP modes
  - [ ] HIE-CM consent artifact generation
- **Testing:** Create ABHA in sandbox, verify consent

---

#### BE-16: HPR/HFR Integration
- **Assigned Engineer:** Backend Engineer
- **Effort:** Medium (3 days)
- **Acceptance Criteria:**
  - [ ] Register therapists with HPR
  - [ ] Register practices with HFR
- **Testing:** Verify Registration numbers

---

#### BE-17: Group Practice Features
- **Assigned Engineer:** Backend Engineer
- **Effort:** Medium (3 days)
- **Acceptance Criteria:**
  - [ ] Audit logs for group admin
  - [ ] Multi-therapist RLS policies
- **Testing:** Verify permissions across accounts

---

#### BE-18: ABDM Certification Workflows
- **Assigned Engineer:** Backend Engineer
- **Effort:** Medium (3 days)
- **Acceptance Criteria:**
  - [ ] Sandbox exit form submission
  - [ ] WASA report generation
- **Testing:** Complete sandbox milestones

---

#### BE-19: Enhanced RAG (Mental Healthcare Act 2017)
- **Assigned Engineer:** Backend Engineer
- **Effort:** Small (2 days)
- **Acceptance Criteria:**
  - [ ] Legal compliance context included in AI prompts
- **Testing:** Verify AI output with legal references

---

#### BE-20: Rollbar Compliance Logging
- **Assigned Engineer:** Backend Engineer
- **Effort:** Small (1 day)
- **Acceptance Criteria:**
  - [ ] PII masking in Rollbar logs for compliance
- **Testing:** Trigger error and verify masking

---

### Frontend User Stories

#### FE-14: ABHA ID Management UI
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Medium (3 days)
- **Acceptance Criteria:**
  - [ ] Create ABHA ID for patients flow
  - [ ] QR code scanning for ABHA
- **Testing:** Link ABHA from UI

---

#### FE-15: Group Admin Dashboard
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Large (4 days)
- **Acceptance Criteria:**
  - [ ] Audit logs view
  - [ ] Compliance status indicators
- **Testing:** Verify data aggregation

---

#### FE-16: HIE-CM Consent UI
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Medium (3 days)
- **Acceptance Criteria:**
  - [ ] Granular consent toggles (notes, bio-data, prescriptions)
- **Testing:** Revoke consent from UI

---

#### FE-17: Referral Letter Generation
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Small (1 day)
- **Acceptance Criteria:**
  - [ ] Generate referral letter PDF with standard footer
- **Testing:** Generate and view PDF

---

#### FE-18: EAP ROI Dashboard
- **Assigned Engineer:** Frontend Engineer
- **Effort:** Medium (3 days)
- **Acceptance Criteria:**
  - [ ] Charts showing HRV vs. anxiety scores (aggregate)
- **Testing:** Verify export capability
