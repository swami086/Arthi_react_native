ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE soap_notes ENABLE ROW LEVEL SECURITY;

-- Practices table policies
CREATE POLICY "Users can view own practice" ON practices
  FOR SELECT USING (
    owner_user_id = auth.uid() OR
    id IN (SELECT practice_id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Practice owners can update" ON practices
  FOR UPDATE USING (owner_user_id = auth.uid());

CREATE POLICY "Authenticated users can create practice" ON practices
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Profiles table policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view practice members" ON profiles
  FOR SELECT USING (
    practice_id IN (
      SELECT practice_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Appointments table policies
CREATE POLICY "Users can view practice appointments" ON appointments
  FOR SELECT USING (
    practice_id IN (
      SELECT practice_id FROM profiles WHERE user_id = auth.uid()
    ) OR
    mentor_id = auth.uid() OR
    mentee_id = auth.uid()
  );

CREATE POLICY "Users can create practice appointments" ON appointments
  FOR INSERT WITH CHECK (
    practice_id IN (
      SELECT practice_id FROM profiles WHERE user_id = auth.uid()
    ) OR
    mentor_id = auth.uid() OR
    mentee_id = auth.uid()
  );

-- Session recordings table policies
CREATE POLICY "Users can view practice recordings" ON session_recordings
  FOR SELECT USING (
    practice_id IN (
      SELECT practice_id FROM profiles WHERE user_id = auth.uid()
    ) OR
    mentor_id = auth.uid() OR
    mentee_id = auth.uid()
  );

CREATE POLICY "Mentors can create recordings" ON session_recordings
  FOR INSERT WITH CHECK (mentor_id = auth.uid());

-- Transcripts table policies
CREATE POLICY "Users can view practice transcripts" ON transcripts
  FOR SELECT USING (
    practice_id IN (
      SELECT practice_id FROM profiles WHERE user_id = auth.uid()
    ) OR
    recording_id IN (
      SELECT id FROM session_recordings 
      WHERE mentor_id = auth.uid() OR mentee_id = auth.uid()
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
      WHERE mentor_id = auth.uid() OR mentee_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can update soap notes" ON soap_notes
  FOR UPDATE USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE mentor_id = auth.uid()
    )
  );

-- Practice settings policies
CREATE POLICY "Practice owners can view settings" ON practice_settings
  FOR SELECT USING (
    practice_id IN (
      SELECT id FROM practices WHERE owner_user_id = auth.uid()
    ) OR
    practice_id IN (
      SELECT practice_id FROM profiles 
      WHERE user_id = auth.uid() AND practice_role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Practice owners can update settings" ON practice_settings
  FOR UPDATE USING (
    practice_id IN (
      SELECT id FROM practices WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Practice owners can insert settings" ON practice_settings
  FOR INSERT WITH CHECK (
    practice_id IN (
      SELECT id FROM practices WHERE owner_user_id = auth.uid()
    )
  );

-- Practice branding policies
CREATE POLICY "Practice members can view branding" ON practice_branding
  FOR SELECT USING (
    practice_id IN (
      SELECT practice_id FROM profiles WHERE user_id = auth.uid()
    ) OR
    practice_id IN (
      SELECT id FROM practices WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Practice owners can update branding" ON practice_branding
  FOR UPDATE USING (
    practice_id IN (
      SELECT id FROM practices WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Practice owners can insert branding" ON practice_branding
  FOR INSERT WITH CHECK (
    practice_id IN (
      SELECT id FROM practices WHERE owner_user_id = auth.uid()
    )
  );

-- Practice invite codes policies
CREATE POLICY "Practice members can view invite codes" ON practice_invite_codes
  FOR SELECT USING (
    practice_id IN (
      SELECT practice_id FROM profiles WHERE user_id = auth.uid()
    ) OR
    practice_id IN (
      SELECT id FROM practices WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Practice owners can create invite codes" ON practice_invite_codes
  FOR INSERT WITH CHECK (
    practice_id IN (
      SELECT id FROM practices WHERE owner_user_id = auth.uid()
    ) OR
    practice_id IN (
      SELECT practice_id FROM profiles 
      WHERE user_id = auth.uid() AND practice_role IN ('owner', 'admin')
    )
  );
