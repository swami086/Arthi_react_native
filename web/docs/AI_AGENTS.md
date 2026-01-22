# AI Agents Overview

This document provides a technical overview of the AI agents integrated into the SafeSpace platform.

## Architecture

All agents are implemented as **Supabase Edge Functions** (Deno) and communicate with the web frontend via the **A2UI framework**.

### Core Standardizations
- **Models**: Standardized to **GPT-4o** (main tasks) and **GPT-4o-mini** (classification).
- **Orchestration**: Single entry point via `agent-orchestrator`.
- **Memory**: Persistent context via RAG (Retrieval-Augmented Generation).
- **Compliance**: HIPAA compliant PII masking and audit logging.

## Agent Catalog

### 1. Booking Assistant (`booking-agent`)
- **Purpose**: Helps patients find therapists and schedule appointments.
- **Key Features**: Availability checks, therapist matching, scheduling.
- **Integration**: `useBookingAgent` hook + `A2UIBookingInterface`.

### 2. Session Copilot (`session-agent`)
- **Purpose**: Real-time clinical assistant for therapists during sessions.
- **Key Features**: Live transcription analysis, intervention suggestions, risk alerting.
- **Integration**: `useSessionCopilot` hook + `A2UICopilotSidebar`.

### 3. Insights Agent (`insights-agent`)
- **Purpose**: Analytical tool for clinical progress tracking.
- **Key Features**: Pattern identification, progress visualization, outcome metrics.
- **Integration**: `useInsightsAgent` hook + `A2UIInsightsDashboard`.

### 4. Wellness Companion (`followup-agent`)
- **Purpose**: Post-session engagement and support.
- **Key Features**: Wellness checks, mood tracking, homework verification.
- **Integration**: `useFollowupAgent` hook + `A2UIFollowupForm`.

## Development

### Adding a New Agent
1. Create a new Edge Function in `mobile/supabase/functions/`.
2. Register the agent in the `agent-orchestrator` intent classifier.
3. Create a specialized React hook in `web/hooks/`.
4. Implement A2UI surfaces for the agent's interactions.

## Security & Compliance
All agent interactions are logged with PII masking and stored in encrypted database tables. Audit trails are maintained in `agent_executions`.
