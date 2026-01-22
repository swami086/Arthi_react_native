-- Calendar Management Agent - Database Schema
-- Migration: 052_calendar_management_agent.sql

-- Calendar Integrations (therapist can plug/unplug)
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook')),
  access_token TEXT NOT NULL, -- Will be encrypted at application level
  refresh_token TEXT, -- Will be encrypted at application level
  calendar_id TEXT,
  is_connected BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(therapist_id, provider)
);

-- Cached Calendar Events (for conflict detection)
CREATE TABLE IF NOT EXISTS calendar_events_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  external_event_id TEXT,
  title TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_busy BOOLEAN DEFAULT true,
  source TEXT CHECK (source IN ('google', 'outlook', 'internal')),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Slot Proposals (sent to patients)
CREATE TABLE IF NOT EXISTS slot_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  proposed_slots JSONB NOT NULL, -- Array of {start, end, confidence}
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  selected_slot JSONB, -- {start, end} when accepted
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar Preferences (add to profiles table)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS calendar_preferences JSONB DEFAULT '{
  "working_hours": {"start": "09:00", "end": "17:00"},
  "buffer_minutes": 15,
  "auto_accept": false,
  "timezone": "UTC"
}'::jsonb;

-- Calendar Visibility Settings (add to profiles table)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS calendar_visibility JSONB DEFAULT '{
  "visible_to_practice": true,
  "show_busy_only": true
}'::jsonb;

-- Indexes for calendar_integrations
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_therapist ON calendar_integrations(therapist_id);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_provider ON calendar_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_connected ON calendar_integrations(is_connected) WHERE is_connected = true;

-- Indexes for calendar_events_cache
CREATE INDEX IF NOT EXISTS idx_calendar_events_therapist_time ON calendar_events_cache(therapist_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_expires ON calendar_events_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_calendar_events_source ON calendar_events_cache(source);

-- Indexes for slot_proposals
CREATE INDEX IF NOT EXISTS idx_slot_proposals_patient_status ON slot_proposals(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_slot_proposals_therapist_status ON slot_proposals(therapist_id, status);
CREATE INDEX IF NOT EXISTS idx_slot_proposals_expires ON slot_proposals(expires_at);

-- RLS Policies for calendar_integrations
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS therapist_own_integrations ON calendar_integrations;
CREATE POLICY therapist_own_integrations ON calendar_integrations
  FOR ALL USING (therapist_id = auth.uid());

-- RLS Policies for calendar_events_cache
ALTER TABLE calendar_events_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS therapist_own_events ON calendar_events_cache;
CREATE POLICY therapist_own_events ON calendar_events_cache
  FOR SELECT USING (therapist_id = auth.uid());

-- Team calendar visibility (busy/free only)
DROP POLICY IF EXISTS view_team_availability ON calendar_events_cache;
CREATE POLICY view_team_availability ON calendar_events_cache
  FOR SELECT USING (
    therapist_id IN (
      SELECT user_id FROM profiles 
      WHERE practice_id = (SELECT practice_id FROM profiles WHERE user_id = auth.uid())
      AND (SELECT calendar_visibility->>'visible_to_practice' FROM profiles WHERE user_id = therapist_id)::boolean = true
    )
  );

-- RLS Policies for slot_proposals
ALTER TABLE slot_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS patient_own_proposals ON slot_proposals;
CREATE POLICY patient_own_proposals ON slot_proposals
  FOR SELECT USING (patient_id = auth.uid() OR therapist_id = auth.uid());

DROP POLICY IF EXISTS therapist_manage_proposals ON slot_proposals;
CREATE POLICY therapist_manage_proposals ON slot_proposals
  FOR ALL USING (therapist_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_calendar_integrations_updated_at ON calendar_integrations;
CREATE TRIGGER update_calendar_integrations_updated_at
    BEFORE UPDATE ON calendar_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_slot_proposals_updated_at ON slot_proposals;
CREATE TRIGGER update_slot_proposals_updated_at
    BEFORE UPDATE ON slot_proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Cleanup expired events (run via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_calendar_events()
RETURNS void AS $$
BEGIN
    DELETE FROM calendar_events_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Cleanup expired slot proposals
CREATE OR REPLACE FUNCTION cleanup_expired_slot_proposals()
RETURNS void AS $$
BEGIN
    UPDATE slot_proposals 
    SET status = 'expired' 
    WHERE expires_at < NOW() AND status = 'pending';
END;
$$ LANGUAGE plpgsql;
