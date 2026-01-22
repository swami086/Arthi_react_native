-- Migration 050: Granular RLS and Authorization Guards
-- Drop overly broad practice filters and restore granular ownership checks

-- 1. Helper Function to drop generic practice policies
DO $$
DECLARE
    table_name_var TEXT;
    tables_to_drop TEXT[] := ARRAY['patients', 'sessions', 'biometrics', 'consents', 'messages', 'reviews', 'patient_goals', 'therapist_notes', 'patient_referrals', 'appointments', 'session_recordings', 'transcripts', 'soap_notes', 'notifications'];
BEGIN
    FOREACH table_name_var IN ARRAY tables_to_drop
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "practice_isolation_select" ON public.%I', table_name_var);
        EXECUTE format('DROP POLICY IF EXISTS "practice_isolation_insert" ON public.%I', table_name_var);
        EXECUTE format('DROP POLICY IF EXISTS "practice_isolation_update" ON public.%I', table_name_var);
        EXECUTE format('DROP POLICY IF EXISTS "practice_isolation_delete" ON public.%I', table_name_var);
    END LOOP;
END $$;

-- 2. MESSAGES: Sender or Receiver + Practice Isolation
CREATE POLICY "messages_select" ON public.messages FOR SELECT 
USING (practice_id = current_practice_id() AND (sender_id = auth.uid() OR receiver_id = auth.uid()));

CREATE POLICY "messages_insert" ON public.messages FOR INSERT 
WITH CHECK (practice_id = current_practice_id() AND sender_id = auth.uid());

-- 3. PATIENT_GOALS: Patient or Connected Therapist + Practice Isolation
CREATE POLICY "patient_goals_select" ON public.patient_goals FOR SELECT 
USING (
    practice_id = current_practice_id() AND (
        patient_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.therapist_patient_relationships 
            WHERE therapist_id = auth.uid() AND patient_id = public.patient_goals.patient_id
        )
    )
);

CREATE POLICY "patient_goals_insert" ON public.patient_goals FOR INSERT 
WITH CHECK (
    practice_id = current_practice_id() AND 
    EXISTS (
        SELECT 1 FROM public.therapist_patient_relationships 
        WHERE therapist_id = auth.uid() AND patient_id = public.patient_goals.patient_id
    )
);

CREATE POLICY "patient_goals_update" ON public.patient_goals FOR UPDATE 
USING (
    practice_id = current_practice_id() AND 
    EXISTS (
        SELECT 1 FROM public.therapist_patient_relationships 
        WHERE therapist_id = auth.uid() AND patient_id = public.patient_goals.patient_id
    )
);

-- 4. THERAPIST_NOTES: Therapist Only + Practice Isolation
CREATE POLICY "therapist_notes_select" ON public.therapist_notes FOR SELECT 
USING (practice_id = current_practice_id() AND therapist_id = auth.uid());

CREATE POLICY "therapist_notes_all" ON public.therapist_notes FOR ALL 
USING (practice_id = current_practice_id() AND therapist_id = auth.uid());

-- 5. APPOINTMENTS: Participants + Practice Isolation
CREATE POLICY "appointments_select" ON public.appointments FOR SELECT 
USING (practice_id = current_practice_id() AND (therapist_id = auth.uid() OR patient_id = auth.uid()));

CREATE POLICY "appointments_participant_all" ON public.appointments FOR ALL 
USING (practice_id = current_practice_id() AND (therapist_id = auth.uid() OR patient_id = auth.uid()));

-- 6. SESSION_RECORDINGS: Participants + Practice Isolation
CREATE POLICY "session_recordings_select" ON public.session_recordings FOR SELECT 
USING (
    practice_id = current_practice_id() AND 
    EXISTS (
        SELECT 1 FROM public.appointments a 
        WHERE a.id = appointment_id AND (a.therapist_id = auth.uid() OR a.patient_id = auth.uid())
    )
);

-- 7. NOTIFICATIONS: Owner Only + Practice Isolation
CREATE POLICY "notifications_owner_select" ON public.notifications FOR SELECT 
USING (practice_id = current_practice_id() AND user_id = auth.uid());

CREATE POLICY "notifications_owner_all" ON public.notifications FOR ALL 
USING (practice_id = current_practice_id() AND user_id = auth.uid());

-- 8. PATIENTS (Profile Extensions): Practice Isolation + Patient/Therapist check
CREATE POLICY "patients_select" ON public.patients FOR SELECT 
USING (
    practice_id = current_practice_id() AND (
        profile_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.therapist_patient_relationships 
            WHERE therapist_id = auth.uid() AND patient_id = public.patients.profile_id
        )
    )
);

-- 9. Secure get_therapist_stats (Update existing if already created, but adding guard here as well)
-- Handled in 046 directly for fresh installs, but for existing ones:
CREATE OR REPLACE FUNCTION public.get_therapist_stats(therapist_user_id UUID)
RETURNS JSON AS $$
DECLARE
  practice_id_var UUID;
  result JSON;
BEGIN
  -- Authorization guard
  IF NOT (
    auth.uid() = therapist_user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND (is_super_admin = true OR role = 'admin')
    )
  ) THEN
    RAISE EXCEPTION 'Access denied.';
  END IF;

  SELECT practice_id INTO practice_id_var FROM public.profiles WHERE user_id = therapist_user_id;
  
  SELECT json_build_object(
    'total_patients', (SELECT COUNT(*) FROM public.therapist_patient_relationships WHERE therapist_id = therapist_user_id AND status = 'active'),
    'active_sessions', (SELECT COUNT(*) FROM public.appointments WHERE therapist_id = therapist_user_id AND status = 'confirmed' AND start_time >= NOW()),
    'total_hours', (SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time))/3600), 0) FROM public.appointments WHERE therapist_id = therapist_user_id AND status = 'completed'),
    'rating', (SELECT COALESCE(AVG(rating), 5.0) FROM public.reviews WHERE therapist_id = therapist_user_id)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
