-- Drop existing RLS policies referencing old table names
DROP POLICY IF EXISTS "Mentors can view their own relationships" ON therapist_patient_relationships;
DROP POLICY IF EXISTS "Mentees can view their own relationships" ON therapist_patient_relationships;
DROP POLICY IF EXISTS "Mentors can view goals of their mentees" ON patient_goals;
DROP POLICY IF EXISTS "Mentees can view their own goals" ON patient_goals;
DROP POLICY IF EXISTS "Mentors can manage goals" ON patient_goals;
DROP POLICY IF EXISTS "Mentors can view their own notes" ON therapist_notes;
DROP POLICY IF EXISTS "Mentors can manage updated notes" ON therapist_notes;

-- Create policies for therapist_patient_relationships
ALTER TABLE therapist_patient_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view their own relationships" 
ON therapist_patient_relationships FOR SELECT 
USING (auth.uid() = therapist_id);

CREATE POLICY "Patients can view their own relationships" 
ON therapist_patient_relationships FOR SELECT 
USING (auth.uid() = patient_id);

-- Create policies for patient_goals
ALTER TABLE patient_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view goals of their patients" 
ON patient_goals FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM therapist_patient_relationships 
    WHERE therapist_id = auth.uid() 
    AND patient_id = patient_goals.patient_id
  )
);

CREATE POLICY "Patients can view their own goals" 
ON patient_goals FOR SELECT 
USING (auth.uid() = patient_id);

CREATE POLICY "Therapists can manage goals" 
ON patient_goals FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM therapist_patient_relationships 
    WHERE therapist_id = auth.uid() 
    AND patient_id = patient_goals.patient_id
  )
);

-- Create policies for therapist_notes
ALTER TABLE therapist_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view their own notes" 
ON therapist_notes FOR SELECT 
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can manage their own notes" 
ON therapist_notes FOR ALL 
USING (auth.uid() = therapist_id);

-- Recreate policies for profiles (dropped in 009)
CREATE POLICY "Users can read therapist profiles"
ON profiles FOR SELECT
USING (role = 'therapist');

CREATE POLICY "Therapists can read their patients"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM appointments
    WHERE appointments.patient_id = profiles.user_id
    AND appointments.therapist_id = auth.uid()
  )
);

-- Recreate policies for payments (dropped in 009)
CREATE POLICY "Users can view own payments"
ON payments FOR SELECT
USING (
  auth.uid() = patient_id OR 
  auth.uid() = therapist_id OR
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);
