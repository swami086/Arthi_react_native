-- Feature flags for gradual rollout
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INT DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_users UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_name ON feature_flags(name);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(enabled);

-- Seed initial feature flags
INSERT INTO feature_flags (name, description, enabled, rollout_percentage) VALUES
('ai_alpha_users', 'Alpha rollout (10% users)', false, 10),
('ai_beta_users', 'Beta rollout (50% users)', false, 50),
('ai_ga_enabled', 'General availability (100% users)', false, 100),
('booking_agent_enabled', 'Enable BookingAgent', false, 0),
('session_agent_enabled', 'Enable SessionAgent', false, 0),
('insights_agent_enabled', 'Enable InsightsAgent', false, 0),
('followup_agent_enabled', 'Enable FollowupAgent', false, 0),
('ai_chat_enabled', 'Enable embedded chat UI', false, 0),
('proactive_notifications', 'Enable proactive notifications', false, 0),
('generative_ui', 'Enable generative UI components', false, 0);

-- Function to check if feature is enabled for user
CREATE OR REPLACE FUNCTION is_feature_enabled(
  flag_name TEXT,
  check_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  flag_record RECORD;
  user_hash INT;
BEGIN
  SELECT * INTO flag_record
  FROM feature_flags
  WHERE name = flag_name;

  IF NOT FOUND OR NOT flag_record.enabled THEN
    RETURN FALSE;
  END IF;

  -- Check if user is in target list
  IF check_user_id = ANY(flag_record.target_users) THEN
    RETURN TRUE;
  END IF;

  -- Percentage-based rollout
  IF flag_record.rollout_percentage >= 100 THEN
    RETURN TRUE;
  END IF;

  IF flag_record.rollout_percentage <= 0 THEN
    RETURN FALSE;
  END IF;

  -- Hash user ID for consistent assignment
  user_hash := ('x' || substr(md5(check_user_id::text), 1, 8))::bit(32)::int;
  RETURN (abs(user_hash) % 100) < flag_record.rollout_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
