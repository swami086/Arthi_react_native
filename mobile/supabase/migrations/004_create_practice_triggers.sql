-- Function to auto-populate practice_id on appointments
CREATE OR REPLACE FUNCTION set_appointment_practice_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Get practice_id from mentor's profile
  SELECT practice_id INTO NEW.practice_id
  FROM profiles
  WHERE user_id = NEW.mentor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_appointment_practice_id
  BEFORE INSERT ON appointments
  FOR EACH ROW
  WHEN (NEW.practice_id IS NULL)
  EXECUTE FUNCTION set_appointment_practice_id();

-- Function to auto-populate practice_id on session_recordings
CREATE OR REPLACE FUNCTION set_recording_practice_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Get practice_id from appointment
  SELECT practice_id INTO NEW.practice_id
  FROM appointments
  WHERE id = NEW.appointment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_recording_practice_id
  BEFORE INSERT ON session_recordings
  FOR EACH ROW
  WHEN (NEW.practice_id IS NULL)
  EXECUTE FUNCTION set_recording_practice_id();

-- Function to auto-populate practice_id on transcripts
CREATE OR REPLACE FUNCTION set_transcript_practice_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Get practice_id from session_recording
  SELECT practice_id INTO NEW.practice_id
  FROM session_recordings
  WHERE id = NEW.recording_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_transcript_practice_id
  BEFORE INSERT ON transcripts
  FOR EACH ROW
  WHEN (NEW.practice_id IS NULL)
  EXECUTE FUNCTION set_transcript_practice_id();

-- Function to auto-populate practice_id on soap_notes
CREATE OR REPLACE FUNCTION set_soap_note_practice_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Get practice_id from appointment
  SELECT practice_id INTO NEW.practice_id
  FROM appointments
  WHERE id = NEW.appointment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_soap_note_practice_id
  BEFORE INSERT ON soap_notes
  FOR EACH ROW
  WHEN (NEW.practice_id IS NULL)
  EXECUTE FUNCTION set_soap_note_practice_id();

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trigger_practices_updated_at
  BEFORE UPDATE ON practices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_practice_settings_updated_at
  BEFORE UPDATE ON practice_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_practice_branding_updated_at
  BEFORE UPDATE ON practice_branding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_soap_notes_updated_at
  BEFORE UPDATE ON soap_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
