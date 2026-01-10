-- Fix RLS Policies and Triggers (Post-Schema Restoration)

-- 1. Fix RLS Policies (Force Recreate)

-- Appointments
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view appointments" ON appointments;
    DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
    DROP POLICY IF EXISTS "Users can view practice appointments" ON appointments; -- just in case
    
    CREATE POLICY "Users can view appointments" ON appointments
    FOR SELECT USING (
        (practice_id IS NOT NULL AND practice_id IN (
          SELECT practice_id FROM profiles WHERE user_id = auth.uid()
        )) OR
        therapist_id = auth.uid() OR
        patient_id = auth.uid()
    );

    CREATE POLICY "Users can create appointments" ON appointments
    FOR INSERT WITH CHECK (
        (practice_id IS NOT NULL AND practice_id IN (
          SELECT practice_id FROM profiles WHERE user_id = auth.uid()
        )) OR
        therapist_id = auth.uid() OR
        patient_id = auth.uid()
    );
END $$;

-- Session Recordings
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view recordings" ON session_recordings;
    DROP POLICY IF EXISTS "Therapists can create recordings" ON session_recordings;
    
    CREATE POLICY "Users can view recordings" ON session_recordings
    FOR SELECT USING (
        (practice_id IS NOT NULL AND practice_id IN (
          SELECT practice_id FROM profiles WHERE user_id = auth.uid()
        )) OR
        therapist_id = auth.uid() OR
        patient_id = auth.uid()
    );

    CREATE POLICY "Therapists can create recordings" ON session_recordings
    FOR INSERT WITH CHECK (therapist_id = auth.uid());
END $$;

-- Transcripts
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view transcripts" ON transcripts;
    
    CREATE POLICY "Users can view transcripts" ON transcripts
    FOR SELECT USING (
        (practice_id IS NOT NULL AND practice_id IN (
          SELECT practice_id FROM profiles WHERE user_id = auth.uid()
        )) OR
        recording_id IN (
            SELECT id FROM session_recordings 
            WHERE therapist_id = auth.uid() OR patient_id = auth.uid()
        )
    );
END $$;

-- SOAP Notes
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view soap notes" ON soap_notes;
    DROP POLICY IF EXISTS "Therapists can update soap notes" ON soap_notes;
    
    CREATE POLICY "Users can view soap notes" ON soap_notes
    FOR SELECT USING (
        (practice_id IS NOT NULL AND practice_id IN (
          SELECT practice_id FROM profiles WHERE user_id = auth.uid()
        )) OR
        appointment_id IN (
            SELECT id FROM appointments 
            WHERE therapist_id = auth.uid() OR patient_id = auth.uid()
        )
    );

    CREATE POLICY "Therapists can update soap notes" ON soap_notes
    FOR UPDATE USING (
        appointment_id IN (
            SELECT id FROM appointments WHERE therapist_id = auth.uid()
        )
    );
END $$;

-- 2. Fix Triggers
-- set_appointment_practice_id
CREATE OR REPLACE FUNCTION set_appointment_practice_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Get practice_id from therapist's profile
  SELECT practice_id INTO NEW.practice_id
  FROM profiles
  WHERE user_id = NEW.therapist_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_appointment_practice_id ON appointments;
CREATE TRIGGER trigger_set_appointment_practice_id
  BEFORE INSERT ON appointments
  FOR EACH ROW
  WHEN (NEW.practice_id IS NULL)
  EXECUTE FUNCTION set_appointment_practice_id();
