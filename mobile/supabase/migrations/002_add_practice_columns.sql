ALTER TABLE profiles 
  ADD COLUMN practice_id UUID REFERENCES practices(id) ON DELETE SET NULL,
  ADD COLUMN practice_role VARCHAR(50) DEFAULT 'therapist';

CREATE INDEX idx_profiles_practice ON profiles(practice_id);
CREATE INDEX idx_profiles_practice_role ON profiles(practice_id, practice_role);

COMMENT ON COLUMN profiles.practice_role IS 'Role within practice: owner, admin, therapist, staff';

ALTER TABLE appointments 
  ADD COLUMN practice_id UUID REFERENCES practices(id) ON DELETE SET NULL;

CREATE INDEX idx_appointments_practice ON appointments(practice_id);

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS session_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  recording_url TEXT,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  recording_status VARCHAR(50) DEFAULT 'pending',
  consent_captured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add practice_id column
ALTER TABLE session_recordings 
  ADD COLUMN IF NOT EXISTS practice_id UUID REFERENCES practices(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_session_recordings_practice ON session_recordings(practice_id);
CREATE INDEX IF NOT EXISTS idx_session_recordings_appointment ON session_recordings(appointment_id);

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES session_recordings(id) ON DELETE CASCADE,
  transcript_text TEXT NOT NULL,
  language_detected VARCHAR(10),
  word_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add practice_id column
ALTER TABLE transcripts 
  ADD COLUMN IF NOT EXISTS practice_id UUID REFERENCES practices(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transcripts_practice ON transcripts(practice_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_recording ON transcripts(recording_id);

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS soap_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  is_finalized BOOLEAN DEFAULT false,
  edited_by_mentor BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add practice_id column
ALTER TABLE soap_notes 
  ADD COLUMN IF NOT EXISTS practice_id UUID REFERENCES practices(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_soap_notes_practice ON soap_notes(practice_id);
CREATE INDEX IF NOT EXISTS idx_soap_notes_appointment ON soap_notes(appointment_id);
