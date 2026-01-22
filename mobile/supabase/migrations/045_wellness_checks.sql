-- Create wellness_checks table
CREATE TABLE IF NOT EXISTS wellness_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    responses JSONB DEFAULT '{}'::jsonb,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    flagged_for_review BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE wellness_checks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own wellness checks" 
ON wellness_checks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wellness checks" 
ON wellness_checks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Therapists can view wellness checks of their patients" 
ON wellness_checks FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM therapist_patient_relationships
        WHERE therapist_patient_relationships.patient_id = wellness_checks.user_id
        AND therapist_patient_relationships.therapist_id = auth.uid()
        AND therapist_patient_relationships.status = 'active'
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS wellness_checks_user_id_idx ON wellness_checks(user_id);
CREATE INDEX IF NOT EXISTS wellness_checks_completed_at_idx ON wellness_checks(completed_at);
CREATE INDEX IF NOT EXISTS wellness_checks_flagged_idx ON wellness_checks(flagged_for_review);

-- Trigger for updated_at
CREATE TRIGGER set_wellness_checks_updated_at
BEFORE UPDATE ON wellness_checks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
