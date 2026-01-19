# Session Agent

The Session Agent is a clinically-aware AI designed to assist therapists in real-time by analyzing session transcripts. It leverages OpenAI's GPT-4o model to provide insights, detect risks, and suggest therapeutic interventions.

## Features

- **Real-time Transcript Analysis**: Analyzes session transcripts as they are updated.
- **Risk Detection**: Identifies potential safety concerns (self-harm, suicide ideation, etc.) with severity levels and clinical evidence.
- **Evidence-Based Interventions**: Suggests CBT, DBT, and ACT techniques relevant to the current session context.
- **Behavioral Pattern Recognition**: Detects recurring themes, triggers, and progress indicators across sessions.
- **SOAP Note Pre-filling**: Generates structured SOAP note templates based on the session's subjective, objective, assessment, and plan sections.
- **A2UI Integration**: Dynamically generates and updates UI components in the therapist's copilot sidebar.

## Action Routing

The agent handles several interactive actions:

- `analyze_transcript`: Performs a full analysis of a specific transcript.
- `apply_intervention`: Logs the therapist's choice of intervention for inclusion in session notes.
- `flag_for_review`: Flags a session for supervisor review based on detected risks.
- `save_soap_note`: Saves a draft or updates an existing SOAP note for the appointment.
- `refresh_analysis`: Triggers a manual refresh of the analysis.

## Infrastructure

- **Supabase Edge Function**: The core logic runs in a secure, serverless environment.
- **OpenAI GPT-4o**: Used for advanced NLP and clinical reasoning.
- **Supabase Realtime**: Broadcasts analysis updates to the client in real-time.
- **A2UI Framework**: Manages the life-cycle and synchronization of the agent's UI state.

## Environment Variables Required

- `SUPABASE_URL`: Your Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access.
- `OPENAI_API_KEY`: API key for accessing GPT-4o.
- `ROLLBAR_SERVER_ACCESS_TOKEN`: For error reporting and monitoring.

## Integration in UI

Use the `useSessionCopilot` hook in your React components to interact with this agent.

```tsx
const { surface, loading, refreshAnalysis } = useSessionCopilot({
    userId,
    appointmentId,
    transcriptId
});
```
