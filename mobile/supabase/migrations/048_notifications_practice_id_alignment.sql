-- Add practice_id to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS practice_id UUID REFERENCES practices(id);

-- Set default for new rows
ALTER TABLE notifications ALTER COLUMN practice_id SET DEFAULT current_practice_id();

-- Update existing notifications if possible (e.g. from user profile)
UPDATE notifications n
SET practice_id = p.practice_id
FROM profiles p
WHERE n.user_id = p.user_id
AND n.practice_id IS NULL;

-- Add RLS policy for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS practice_isolation_select ON notifications;
CREATE POLICY practice_isolation_select ON notifications
    FOR SELECT USING (practice_id = current_practice_id());

DROP POLICY IF EXISTS practice_isolation_insert ON notifications;
CREATE POLICY practice_isolation_insert ON notifications
    FOR INSERT WITH CHECK (practice_id = current_practice_id());

DROP POLICY IF EXISTS practice_isolation_update ON notifications;
CREATE POLICY practice_isolation_update ON notifications
    FOR UPDATE USING (practice_id = current_practice_id());

DROP POLICY IF EXISTS practice_isolation_delete ON notifications;
CREATE POLICY practice_isolation_delete ON notifications
    FOR DELETE USING (practice_id = current_practice_id());
