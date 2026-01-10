-- Drop old trigger/function
DROP TRIGGER IF EXISTS trigger_set_appointment_practice_id ON appointments;
DROP FUNCTION IF EXISTS set_appointment_practice_id();

-- Create new function using therapist_id
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

-- Re-attach trigger
CREATE TRIGGER trigger_set_appointment_practice_id
  BEFORE INSERT ON appointments
  FOR EACH ROW
  WHEN (NEW.practice_id IS NULL)
  EXECUTE FUNCTION set_appointment_practice_id();
