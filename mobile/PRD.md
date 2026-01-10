# Product Requirements Document (PRD): SafeSpaceApp (India)

## 1. Executive Summary
**SafeSpaceApp** is an "AI-First Practice Management Operating System" designed specifically for independent mental health practitioners in India. Unlike fragmented tools (Zoom for calls, WhatsApp for scheduling, pen-paper for notes), SafeSpaceApp unifies the entire clinical workflow into a single mobile-first platform.

**Core Value Proposition:**
*   **For Therapists:** Saves 2+ hours/day on documentation via "Hinglish" AI Scribing and automated WhatsApp scheduling.
*   **For Patients:** seamless access to care with "conversational booking" and secure video sessions.

**differentiation:**
*   **Vernacular AI:** Optimized for Indian accents and code-mixing (Hindi + English).
*   **Distribution:** WhatsApp-first patient engagement.
*   **Pricing:** ₹999/month (vs. global tools @ ₹5,000+).

---

## 2. Software Bill of Materials (SBOM) & Cost Analysis

### 2.1 API Stack

| Component | Provider | Purpose | Logic / Usage |
| :--- | :--- | :--- | :--- |
| **Backend & Auth** | **Supabase** | Database, Auth, Realtime, Vector Store | Core infrastructure. Host in **AWS Mumbai** (for DPDP compliance). |
| **AI Scribe** | **OpenAI Whisper** | Audio -> Text | Transcribing Hinglish sessions. |
| **AI Intelligence** | **OpenAI GPT-4o** | Text -> SOAP Note | Summarizing transcripts into clinical notes. |
| **Video Calls** | **Daily.co** (or Agora) | Telehealth | Secure, HIPAA-compliant video rooms. |
| **Payments** | **Razorpay Route** | Splits & Settlements | Collecting fees from patients, splitting % to platform, payout to doctor. |
| **Messaging** | **WhatsApp Biz API** | Notifications | Appointment reminders, booking links. |

### 2.2 Cost Per Session Analysis (Unit Economics)
*Assumptions: Average session = 50 mins. Average speaking time ~40 mins.*

| Item | Unit Cost | Cost per 50-min Session |
| :--- | :--- | :--- |
| **Transcription** (Whisper) | $0.006 / min | $0.24 (₹20) |
| **Summarization** (GPT-4o) | ~$5.00 / 1M tokens | ~$0.05 (₹4) |
| **Video Call** (Daily.co) | Free tier / $0.004/min | $0.00 - $0.20 (₹0 - ₹16) |
| **WhatsApp** (Utility) | ₹0.12 / msg | ₹0.24 (2 msgs) |
| **Database/Storage** | Marginal | ₹1.00 |
| **TOTAL COST** | | **~₹25 - ₹45 per session** |

**Business Model Viability:**
If a therapist pays **₹999/month**, and does ~40 sessions/month:
*   Total Operational Cost: 40 * ₹30 = ₹1,200 (Loss leader on heavy users)
*   **Strategy:** Cap "AI Scribe" minutes in the ₹999 plan (e.g., 600 mins/mo). Charge add-on for unlimited.

---

## 3. Product Roadmap

### Phase 1: The "Smart Scribe" MVP (Weeks 1-4)
*Goal: Give therapists a "Magic Wand" for notes.*
*   **Features:**
    *   **Secure Audio Recording** (Local + Upload).
    *   **Transcribe** (Whisper API).
    *   **Generate SOAP** (GPT-4o).
    *   **Manual Edit & Save** to `MentorNotes`.
*   **Deliverable:** An app updated where a therapist can press "Record" during a session and get a note 30s after finishing.

### Phase 2: The "Practice Manager" (Weeks 5-8)
*Goal: Replace their calendar and WhatsApp manual replies.*
*   **Features:**
    *   **WhatsApp Bot:** "Hi, here is my calendar link."
    *   **Appointment Booking:** Integrated Razorpay checkout.
    *   **Video Room:** One-click "Join Room" for both parties.

### Phase 3: The "Clinical Intelligence" (Weeks 9-12)
*Goal: Long-term retention.*
*   **Features:**
    *   **Patient Trends:** "Patient anxiety words decreased by 20% over 5 sessions."
    *   **Smart Search:** "Show me all patients who discussed 'career stress' recently."

---

## 4. Comprehensive User Stories

### 4.1 Persona: Dr. Priya (The Independent Therapist)
| Stage | Story | Acceptance Criteria |
| :--- | :--- | :--- |
| **Onboarding** | As Priya, I want to set my availability and fees so clients can book me. | - Dashboard to set M-F 10am-6pm.<br>- Set "Price per session". |
| **Session** | As Priya, I want to record my session audio securely so I don't have to take notes while listening. | - "Start Recording" button visible in Active Appointment.<br>- Visual waveform to show it's working.<br>- Auto-pause if call comes in. |
| **Documentation** | As Priya, I want an auto-generated SOAP note immediately after the session. | - < 1 min wait time.<br>- Format: Subjective, Objective, Assessment, Plan.<br>- Ability to edit before "Finalizing". |
| **History** | As Priya, I want to search my past notes for keywords like "Insomnia" to recall details. | - Search bar in Patient Detail view.<br>- Results highlight the specific note date. |

### 4.2 Persona: Rahul (The Patient/Mentee)
| Stage | Story | Acceptance Criteria |
| :--- | :--- | :--- |
| **Discovery** | As Rahul, I want to find a therapist who speaks Tamil and deals with "Work Stress". | - Filter Mentors by Language & Specialty.<br>- "Smart Match" card suggesting top 3 matches. |
| **Booking** | As Rahul, I want to book a slot and pay via UPI. | - Calendar view of available slots.<br>- Razorpay UPI intent flow.<br>- WhatsApp confirmation received. |
| **Session** | As Rahul, I want to join the video call without installing a new app (if possible) or easily via the SafeSpace app. | - "Join Session" button active 5 mins before start.<br>- Works on low bandwidth (Audio-only fallback). |

### 4.3 Persona: Super Admin (You)
| Stage | Story | Acceptance Criteria |
| :--- | :--- | :--- |
| **Compliance** | As Admin, I need to ensure patient data is encrypted and deleted if requested (DPDP). | - "Delete Patient Data" button in Admin Panel.<br>- Logs of all data access. |
| **Revenue** | As Admin, I want to see the commission split from every session. | - Dashboard showing "Gross Transaction Agent" vs "Net Platform Revenue". |

## 5. Compliance & Security (India Context)
*   **Data Residency:** All database instances (Supabase) must be pinned to **AWS Mumbai (ap-south-1)**.
*   **Consent Manager:** First login must have a "DPDP Consent Form" checkbox.
*   **Transcription Privacy:** OpenAI `Zero Data Retention` policy must be enabled (Enterprise/B2C opt-out) to ensure voice data isn't used for training models.

