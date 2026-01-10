-- Drop existing policies that use old column names or table names
-- (Note: Postgres might have auto-renamed the table reference in the policy, but the column references inside USING might break or need explicit update if they weren't auto-renamed or just for cleanliness)

DROP POLICY IF EXISTS "Users can view practice appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create practice appointments" ON appointments;
DROP POLICY IF EXISTS "Users can view practice recordings" ON session_recordings;
DROP POLICY IF EXISTS "Mentors can create recordings" ON session_recordings;
DROP POLICY IF EXISTS "Users can view practice transcripts" ON transcripts;
DROP POLICY IF EXISTS "Users can view practice soap notes" ON soap_notes;
DROP POLICY IF EXISTS "Mentors can update soap notes" ON soap_notes;

-- Recreate policies with new column names

-- Appointments table policies
CREATE POLICY "Users can view practice appointments" ON appointments
  FOR SELECT USING (
    practice_id IN (
      SELECT practice_id FROM profiles WHERE user_id = auth.uid()
    ) OR
    therapist_id = auth.uid() OR
    patient_id = auth.uid()
  );

CREATE POLICY "Users can create practice appointments" ON appointments
  FOR INSERT WITH CHECK (
    practice_id IN (
      SELECT practice_id FROM profiles WHERE user_id = auth.uid()
    ) OR
    therapist_id = auth.uid() OR
    patient_id = auth.uid()
  );

-- Session recordings table policies
CREATE POLICY "Users can view practice recordings" ON session_recordings
  FOR SELECT USING (
    practice_id IN (
      SELECT practice_id FROM profiles WHERE user_id = auth.uid()
    ) OR
    therapist_id = auth.uid() OR
    patient_id = auth.uid()
  );

CREATE POLICY "Therapists can create recordings" ON session_recordings
  FOR INSERT WITH CHECK (therapist_id = auth.uid());

-- Transcripts table policies
CREATE POLICY "Users can view practice transcripts" ON transcripts
  FOR SELECT USING (
    practice_id IN (
      SELECT practice_id FROM profiles WHERE user_id = auth.uid()
    ) OR
    recording_id IN (
      SELECT id FROM session_recordings 
      WHERE therapist_id = auth.uid() OR patient_id = auth.uid()
    )
  );

-- SOAP notes table policies
CREATE POLICY "Users can view practice soap notes" ON soap_notes
  FOR SELECT USING (
    practice_id IN (
      SELECT practice_id FROM profiles WHERE user_id = auth.uid()
    ) OR
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
