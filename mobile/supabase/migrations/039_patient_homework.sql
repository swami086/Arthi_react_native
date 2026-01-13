-- Patient Homework Table
CREATE TABLE patient_homework (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  completion_status TEXT DEFAULT 'pending' CHECK (completion_status IN ('pending', 'completed', 'overdue', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_patient_homework_patient ON patient_homework(patient_id);
CREATE INDEX idx_patient_homework_therapist ON patient_homework(therapist_id);
CREATE INDEX idx_patient_homework_status ON patient_homework(completion_status);
CREATE INDEX idx_patient_homework_due_date ON patient_homework(due_date DESC);
CREATE INDEX idx_patient_homework_created ON patient_homework(created_at DESC);

-- RLS Policies
ALTER TABLE patient_homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own homework"
  ON patient_homework FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Therapists can view assigned homework"
  ON patient_homework FOR SELECT
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create homework"
  ON patient_homework FOR INSERT
  WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update assigned homework"
  ON patient_homework FOR UPDATE
  USING (auth.uid() = therapist_id);

CREATE POLICY "Patients can update completion status"
  ON patient_homework FOR UPDATE
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Trigger to enforce column-level security for patients
CREATE OR REPLACE FUNCTION check_patient_homework_immutable_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF (auth.uid() = OLD.patient_id) THEN
    IF (NEW.patient_id IS DISTINCT FROM OLD.patient_id OR
        NEW.therapist_id IS DISTINCT FROM OLD.therapist_id OR
        NEW.title IS DISTINCT FROM OLD.title OR
        NEW.description IS DISTINCT FROM OLD.description OR
        NEW.due_date IS DISTINCT FROM OLD.due_date) THEN
      RAISE EXCEPTION 'Patients can only update completion status and completed_at fields.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_patient_homework_immutable_fields
  BEFORE UPDATE ON patient_homework
  FOR EACH ROW
  EXECUTE FUNCTION check_patient_homework_immutable_fields();

-- Trigger
CREATE TRIGGER update_patient_homework_updated_at
  BEFORE UPDATE ON patient_homework
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
