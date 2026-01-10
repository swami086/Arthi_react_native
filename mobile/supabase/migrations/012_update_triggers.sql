-- Drop triggers referencing old tables
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate trigger for new profile creation (if needed, usually safe to keep user creation trigger generic, but if it sets default role/data based on metadata)
-- Assuming standard usage, we might not need to change the trigger strictly if it just inserts into profiles.
-- However, if there are triggers on mentor_mentee_relationships, we need to update them.

-- Example: Trigger to update timestamps on therapist_patient_relationships
CREATE OR REPLACE FUNCTION update_therapist_patient_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_mentor_mentee_updated_at ON therapist_patient_relationships;
CREATE TRIGGER update_therapist_patient_updated_at
BEFORE UPDATE ON therapist_patient_relationships
FOR EACH ROW
EXECUTE FUNCTION update_therapist_patient_updated_at();

-- Example: Trigger for updating therapist_notes timestamps
CREATE OR REPLACE FUNCTION update_therapist_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_mentor_notes_updated_at ON therapist_notes;
CREATE TRIGGER update_therapist_notes_updated_at
BEFORE UPDATE ON therapist_notes
FOR EACH ROW
EXECUTE FUNCTION update_therapist_notes_updated_at();
