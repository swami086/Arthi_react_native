
-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create secrets in Supabase Vault
-- The project_url is set for project: pqjwldzyogmdangllnlr
-- Signature: vault.create_secret(secret_content, name, description)
SELECT vault.create_secret('https://pqjwldzyogmdangllnlr.supabase.co', 'project_url', 'Supabase Project URL');
SELECT vault.create_secret('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxandsZHp5b2dtZGFuZ2xsbmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY4MTI4NywiZXhwIjoyMDgxMjU3Mjg3fQ.F2PFSWy3UeM00K5vYSzl0uBqHL1WL0FsgcmUeFVuiOU', 'service_role_key', 'Supabase Service Role Key');

-- Setup the cron job
SELECT cron.schedule(
  'invoke-proactive-agent-cron',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/proactive-agent-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := jsonb_build_object('source', 'cron', 'time', now()::text),
    timeout_milliseconds := 30000
  );
  $$
);

COMMENT ON COLUMN cron.job.jobname IS 'Invoke proactive-agent-cron edge function every 15 minutes';
