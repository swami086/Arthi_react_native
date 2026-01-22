# Deployment Checklist

Follow this checklist to ensure a safe and successful deployment of the AI Agent infrastructure.

## 1. Environment Variables Verification
Ensure the following variables are set in the production environment (Vercel):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_ENABLE_AI_AGENTS=true`
- `NEXT_PUBLIC_AI_MODEL=gpt-4o`
- `ROLLBAR_SERVER_TOKEN`

## 2. Supabase Edge Functions
Deploy all required functions using the Supabase CLI:
```bash
supabase functions deploy agent-orchestrator
supabase functions deploy booking-agent
supabase functions deploy session-agent
supabase functions deploy insights-agent
supabase functions deploy followup-agent
supabase functions deploy rag-retrieve
```

## 3. Database Migrations
Verify that all AI-related tables and vector extensions are applied:
- `agent_conversations`
- `agent_memory` (with pgvector)
- `agent_tools`
- `user_agent_preferences`
- `feature_flags`

## 4. Feature Flags
Configure the initial rollout in the `feature_flags` table:
- `ai_booking_agent`: 100%
- `ai_session_copilot`: 100%
- `ai_insights_dashboard`: 50%
- `ai_followup_agent`: 25%

## 5. Security Audit
- [ ] Confirm HIPAA logging is active in `agent_executions`.
- [ ] Verify PII masking is working in Edge Functions.
- [ ] Check that RLS policies are restricting `agent_memory` access to the correct user.

## 6. Monitoring Setup
- [ ] Verify Rollbar is receiving client and server errors.
- [ ] Check PostHog for agent engagement tracking.
- [ ] Monitor Edge Function logs for OpenAI timeout errors (target < 3.5s).

## 7. Rollback Procedure
If errors exceed 5% or latency > 5s:
1. Disable AI features via `NEXT_PUBLIC_ENABLE_AI_AGENTS=false`.
2. Revert to the last stable deployment on Vercel.
3. Check `llm-client` logs for model fallback status.
