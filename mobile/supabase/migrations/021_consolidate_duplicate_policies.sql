-- Appointments: Consolidate SELECT policies
DROP POLICY IF EXISTS "Users can read their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
-- Keep only "Users can view appointments"

-- Appointments: Consolidate INSERT policies
DROP POLICY IF EXISTS "Mentees can create appointments" ON appointments;
DROP POLICY IF EXISTS "Mentees can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Mentors can create appointments" ON appointments;
-- Keep only "Users can create appointments"

-- Appointments: Consolidate UPDATE policies
DROP POLICY IF EXISTS "Mentors can update appointments" ON appointments;
-- Keep only "Users can update their own appointments"

-- Patient Goals: Consolidate policies
DROP POLICY IF EXISTS "Mentors can CRUD goals for their mentees" ON patient_goals;
DROP POLICY IF EXISTS "Mentees can read their own goals" ON patient_goals;
DROP POLICY IF EXISTS "Mentees can update progress on their goals" ON patient_goals;
-- Keep only "Therapists can manage goals", "Patients can view their own goals", "Therapists can view goals of their patients"

-- Profiles: Consolidate policies
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read therapist profiles" ON profiles;
-- Keep only "Users can view all profiles", "Therapists can read their patients"

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
-- Keep only "Users can update their own profile"

-- Session Recordings: Consolidate policies
DROP POLICY IF EXISTS "Enable view for own recordings" ON session_recordings;
-- Keep only "Users can view recordings"

-- SOAP Notes: Consolidate policies
DROP POLICY IF EXISTS "Enable select for mentors" ON soap_notes;
-- Keep only "Users can view soap notes"

DROP POLICY IF EXISTS "Enable update for mentors" ON soap_notes;
-- Keep only "Therapists can update soap notes"

-- Therapist Notes: Consolidate policies
DROP POLICY IF EXISTS "Mentors can CRUD their own notes" ON therapist_notes;
-- Keep only "Therapists can manage their own notes", "Therapists can view their own notes"

-- Therapist Availability: Consolidate policies
DROP POLICY IF EXISTS "Mentors can manage their availability" ON therapist_availability;
-- Keep only "Everyone can view availability"

-- Transcripts: Consolidate policies
DROP POLICY IF EXISTS "Enable select for participants" ON transcripts;
-- Keep only "Users can view transcripts"

-- Optimization: Wrap auth.uid() calls in subqueries for common policies
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Repeating optimization for other core tables
DROP POLICY IF EXISTS "Users can view relevant notifications" ON notifications;
CREATE POLICY "Users can view relevant notifications"
    ON notifications FOR SELECT
    USING (
        (SELECT auth.uid()) = user_id 
        OR 
        (practice_id IS NOT NULL AND practice_id IN (
            SELECT p.practice_id FROM profiles p WHERE p.user_id = (SELECT auth.uid())
        ))
    );

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
