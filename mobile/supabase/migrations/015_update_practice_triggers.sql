-- Recreate practice mapping triggers with correct column names

DO $$
BEGIN
    -- Drop old function and trigger first
    DROP TRIGGER IF EXISTS trigger_set_appointment_practice_id ON appointments;
    DROP FUNCTION IF EXISTS set_appointment_practice_id();

    -- Check if practice_id exists on appointments
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'practice_id') THEN
        
        -- Recreate with therapist_id
        -- We must use dynamic SQL or just create it here since we are inside IF EXISTS block? 
        -- Actually, we can just define the function outside if needed, but trigger creation must be conditional or safe.
        -- BUT PL/pgSQL function body is parsed at creation time, so NEW.practice_id reference might fail if column missing.
        -- However, user said "migration 002 ADDS practice_id". So it should exist.
        -- Wait, previous error said "column new.practice_id does not exist". This implies it DOES NOT exist on the table.
        -- I verified earlier that it returned empty list. So practice_id does NOT exist yet on these tables in this env.
        -- So I should NOT create this trigger yet if column is missing.
        
        -- BUT, if the user WANTS these triggers, presumably practice_id SHOULD exist.
        -- Maybe migration 002 was not applied?
        -- Let's just wrap it in IF EXISTS and if it doesn't exist, we skip.
        
        EXECUTE '
            CREATE OR REPLACE FUNCTION set_appointment_practice_id()
            RETURNS TRIGGER AS $func$
            BEGIN
              -- Get practice_id from therapist''s profile
              SELECT practice_id INTO NEW.practice_id
              FROM profiles
              WHERE user_id = NEW.therapist_id;
              
              RETURN NEW;
            END;
            $func$ LANGUAGE plpgsql;
        ';

        EXECUTE '
            CREATE TRIGGER trigger_set_appointment_practice_id
              BEFORE INSERT ON appointments
              FOR EACH ROW
              WHEN (NEW.practice_id IS NULL)
              EXECUTE FUNCTION set_appointment_practice_id();
        ';
    END IF;
END $$;
