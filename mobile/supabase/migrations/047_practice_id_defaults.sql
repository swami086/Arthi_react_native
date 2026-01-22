-- Add default values for practice_id using current_practice_id() function
-- This ensures that insertions by authenticated users automatically get the correct practice_id

ALTER TABLE messages ALTER COLUMN practice_id SET DEFAULT current_practice_id();
ALTER TABLE reviews ALTER COLUMN practice_id SET DEFAULT current_practice_id();
ALTER TABLE patient_goals ALTER COLUMN practice_id SET DEFAULT current_practice_id();
ALTER TABLE therapist_notes ALTER COLUMN practice_id SET DEFAULT current_practice_id();
ALTER TABLE patient_referrals ALTER COLUMN practice_id SET DEFAULT current_practice_id();
ALTER TABLE therapist_patient_relationships ALTER COLUMN practice_id SET DEFAULT current_practice_id();
ALTER TABLE patients ALTER COLUMN practice_id SET DEFAULT current_practice_id();
ALTER TABLE sessions ALTER COLUMN practice_id SET DEFAULT current_practice_id();
ALTER TABLE biometrics ALTER COLUMN practice_id SET DEFAULT current_practice_id();
ALTER TABLE consents ALTER COLUMN practice_id SET DEFAULT current_practice_id();
ALTER TABLE audit_logs ALTER COLUMN practice_id SET DEFAULT current_practice_id();
ALTER TABLE appointments ALTER COLUMN practice_id SET DEFAULT current_practice_id();

-- Update current_practice_id to be SECURITY DEFINER to ensure it can read profiles table
-- even if RLS on profiles is strict (it should be allowed to read own profile anyway but safe to have)
CREATE OR REPLACE FUNCTION current_practice_id()
RETURNS uuid AS $$
  SELECT practice_id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
