-- Mood Check-ins Table
CREATE TABLE mood_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  notes TEXT,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mood_checkins_patient ON mood_checkins(patient_id);
CREATE INDEX idx_mood_checkins_checked_in ON mood_checkins(checked_in_at DESC);
CREATE INDEX idx_mood_checkins_patient_date ON mood_checkins(patient_id, checked_in_at DESC);
CREATE INDEX idx_mood_checkins_score ON mood_checkins(mood_score);

-- RLS Policies
ALTER TABLE mood_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own mood check-ins"
  ON mood_checkins FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create own mood check-ins"
  ON mood_checkins FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Therapists can view patient mood check-ins"
  ON mood_checkins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM therapist_patient_relationships
      WHERE therapist_id = auth.uid()
      AND patient_id = mood_checkins.patient_id
    )
  );
