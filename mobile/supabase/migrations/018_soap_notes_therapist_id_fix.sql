```sql
-- Migration: 018_soap_notes_therapist_id_fix.sql
ALTER TABLE soap_notes RENAME COLUMN mentor_id TO therapist_id;

-- Update foreign key constraint (cosmetic)
ALTER TABLE soap_notes DROP CONSTRAINT IF EXISTS soap_notes_mentor_id_fkey;
ALTER TABLE soap_notes ADD CONSTRAINT soap_notes_therapist_id_fkey 
  FOREIGN KEY (therapist_id) REFERENCES profiles(user_id);
```
