
CREATE TABLE IF NOT EXISTS a2ui_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  surface_id TEXT,
  agent_id TEXT,
  details JSONB,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for reporting
CREATE INDEX IF NOT EXISTS idx_a2ui_audit_logs_user_id ON a2ui_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_a2ui_audit_logs_timestamp ON a2ui_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_a2ui_audit_logs_event_type ON a2ui_audit_logs(event_type);

-- RLS Policies
ALTER TABLE a2ui_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated users (service role will handle backend logs)
CREATE POLICY "Users can insert their own logs" ON a2ui_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only admins/doctors should read logs (adjust policy as needed)
CREATE POLICY "Users can only see their own logs" ON a2ui_audit_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
