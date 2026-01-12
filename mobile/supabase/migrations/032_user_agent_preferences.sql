-- User preferences for AI agents
CREATE TABLE user_agent_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled_agents TEXT[] DEFAULT ARRAY['booking', 'session', 'insights', 'followup'],
  notification_frequency TEXT DEFAULT 'normal' CHECK (notification_frequency IN ('minimal', 'reduced', 'normal')),
  quiet_hours JSONB DEFAULT '{"start": "22:00", "end": "08:00"}',
  data_sharing_consent BOOLEAN DEFAULT true,
  transparency_level TEXT DEFAULT 'detailed' CHECK (transparency_level IN ('simple', 'detailed', 'technical')),
  classic_mode BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'hi', 'hinglish')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_agent_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON user_agent_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Trigger to create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_agent_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_agent_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_agent_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_agent_preferences();
