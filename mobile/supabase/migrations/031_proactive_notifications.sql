-- Proactive notifications from agents
CREATE TABLE proactive_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('session_prep', 'insight', 'alert', 'followup')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action JSONB,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proactive_notifications_user ON proactive_notifications(user_id);
CREATE INDEX idx_proactive_notifications_read ON proactive_notifications(read);
CREATE INDEX idx_proactive_notifications_created ON proactive_notifications(created_at DESC);
CREATE INDEX idx_proactive_notifications_type ON proactive_notifications(notification_type);

-- RLS Policies
ALTER TABLE proactive_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON proactive_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON proactive_notifications FOR UPDATE
  USING (auth.uid() = user_id);
