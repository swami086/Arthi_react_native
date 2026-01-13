-- Scheduled Messages Table
CREATE TABLE scheduled_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "to" TEXT NOT NULL,
  message TEXT NOT NULL,
  template_name TEXT,
  template_params JSONB DEFAULT '{}',
  scheduled_for TIMESTAMPTZ NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'sms', 'email', 'push')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_scheduled_messages_status ON scheduled_messages(status);
CREATE INDEX idx_scheduled_messages_scheduled_for ON scheduled_messages(scheduled_for);
CREATE INDEX idx_scheduled_messages_channel ON scheduled_messages(channel);
CREATE INDEX idx_scheduled_messages_pending ON scheduled_messages(status, scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_scheduled_messages_created ON scheduled_messages(created_at DESC);

-- RLS Policies
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all scheduled messages"
  ON scheduled_messages FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Trigger
CREATE TRIGGER update_scheduled_messages_updated_at
  BEFORE UPDATE ON scheduled_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
