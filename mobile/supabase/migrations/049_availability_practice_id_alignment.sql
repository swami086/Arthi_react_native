-- Add practice_id to therapist_availability table
ALTER TABLE therapist_availability ADD COLUMN IF NOT EXISTS practice_id UUID REFERENCES practices(id);

-- Set default for new rows
ALTER TABLE therapist_availability ALTER COLUMN practice_id SET DEFAULT current_practice_id();

-- Update existing availability if possible
UPDATE therapist_availability a
SET practice_id = p.practice_id
FROM profiles p
WHERE a.therapist_id = p.user_id
AND a.practice_id IS NULL;

-- Setup RLS
ALTER TABLE therapist_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS practice_isolation_select ON therapist_availability;
CREATE POLICY practice_isolation_select ON therapist_availability
    FOR SELECT USING (practice_id = current_practice_id() OR is_booked = false); -- Allowed to see unbooked across practices? No, probably not in strict multi-tenancy.

-- Only allow seeing availability within the same practice
DROP POLICY IF EXISTS practice_isolation_select ON therapist_availability;
CREATE POLICY practice_isolation_select ON therapist_availability
    FOR SELECT USING (practice_id = current_practice_id());

DROP POLICY IF EXISTS practice_isolation_insert ON therapist_availability;
CREATE POLICY practice_isolation_insert ON therapist_availability
    FOR INSERT WITH CHECK (practice_id = current_practice_id());

DROP POLICY IF EXISTS practice_isolation_update ON therapist_availability;
CREATE POLICY practice_isolation_update ON therapist_availability
    FOR UPDATE USING (practice_id = current_practice_id());

DROP POLICY IF EXISTS practice_isolation_delete ON therapist_availability;
CREATE POLICY practice_isolation_delete ON therapist_availability
    FOR DELETE USING (practice_id = current_practice_id());
