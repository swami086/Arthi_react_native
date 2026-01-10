-- Complete rebranding database migration
-- This migration updates remaining tables and columns that were not covered in 009
-- It ensures 100% "therapist/patient" terminology consistency

-- 1. Rename columns in session_recordings
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_recordings' AND column_name = 'mentor_id') THEN
    ALTER TABLE session_recordings RENAME COLUMN mentor_id TO therapist_id;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_recordings' AND column_name = 'mentee_id') THEN
    ALTER TABLE session_recordings RENAME COLUMN mentee_id TO patient_id;
  END IF;
END $$;

-- 2. Rename columns in soap_notes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'soap_notes' AND column_name = 'edited_by_mentor') THEN
    ALTER TABLE soap_notes RENAME COLUMN edited_by_mentor TO edited_by_therapist;
  END IF;
END $$;

-- 3. Rename mentor_availability table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'mentor_availability') THEN
    ALTER TABLE mentor_availability RENAME TO therapist_availability;
  END IF;
END $$;

-- 4. Rename columns in therapist_availability (renamed from mentor_availability)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'therapist_availability' AND column_name = 'mentor_id') THEN
    ALTER TABLE therapist_availability RENAME COLUMN mentor_id TO therapist_id;
  END IF;
END $$;

-- 5. Rename columns in payments (if any remain)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'mentor_earnings') THEN
    ALTER TABLE payments RENAME COLUMN mentor_earnings TO therapist_earnings;
  END IF;

  -- The plan mentioned mentor_payout, but checking older migrations (specifically 002/003 don't mention payments structure much but 011 implies payments table used by RPC)
  -- If mentor_payout exists, rename it.
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'mentor_payout') THEN
    ALTER TABLE payments RENAME COLUMN mentor_payout TO therapist_payout;
  END IF;
END $$;


-- 6. Update RLS Policies

-- 6. Update RLS Policies

-- Appointments
DO $$
BEGIN
    -- Drop old policies if they exist (safe to run)
    DROP POLICY IF EXISTS "Users can view practice appointments" ON appointments;
    DROP POLICY IF EXISTS "Users can create practice appointments" ON appointments;
    
    -- Create new policies
    -- We assume practice_id exists from migration 002
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Users can view appointments') THEN
        CREATE POLICY "Users can view appointments" ON appointments
        FOR SELECT USING (
            (practice_id IS NOT NULL AND practice_id IN (
              SELECT practice_id FROM profiles WHERE user_id = auth.uid()
            )) OR
            therapist_id = auth.uid() OR
            patient_id = auth.uid()
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Users can create appointments') THEN
        CREATE POLICY "Users can create appointments" ON appointments
        FOR INSERT WITH CHECK (
            (practice_id IS NOT NULL AND practice_id IN (
              SELECT practice_id FROM profiles WHERE user_id = auth.uid()
            )) OR
            therapist_id = auth.uid() OR
            patient_id = auth.uid()
        );
    END IF;
END $$;

-- Session Recordings (Only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'session_recordings') THEN
        DROP POLICY IF EXISTS "Users can view practice recordings" ON session_recordings;
        DROP POLICY IF EXISTS "Mentors can create recordings" ON session_recordings;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_recordings' AND policyname = 'Users can view recordings') THEN
             CREATE POLICY "Users can view recordings" ON session_recordings
             FOR SELECT USING (
                (practice_id IS NOT NULL AND practice_id IN (
                  SELECT practice_id FROM profiles WHERE user_id = auth.uid()
                )) OR
                therapist_id = auth.uid() OR
                patient_id = auth.uid()
             );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_recordings' AND policyname = 'Therapists can create recordings') THEN
             CREATE POLICY "Therapists can create recordings" ON session_recordings
             FOR INSERT WITH CHECK (therapist_id = auth.uid());
        END IF;
    END IF;
END $$;

-- Transcripts (Only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'transcripts') THEN
        DROP POLICY IF EXISTS "Users can view practice transcripts" ON transcripts;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transcripts' AND policyname = 'Users can view transcripts') THEN
            CREATE POLICY "Users can view transcripts" ON transcripts
            FOR SELECT USING (
                (practice_id IS NOT NULL AND practice_id IN (
                  SELECT practice_id FROM profiles WHERE user_id = auth.uid()
                )) OR
                recording_id IN (
                    SELECT id FROM session_recordings 
                    WHERE therapist_id = auth.uid() OR patient_id = auth.uid()
                )
            );
        END IF;
    END IF;
END $$;

-- SOAP Notes (Only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'soap_notes') THEN
        DROP POLICY IF EXISTS "Users can view practice soap notes" ON soap_notes;
        DROP POLICY IF EXISTS "Mentors can update soap notes" ON soap_notes;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'soap_notes' AND policyname = 'Users can view soap notes') THEN
            CREATE POLICY "Users can view soap notes" ON soap_notes
            FOR SELECT USING (
                (practice_id IS NOT NULL AND practice_id IN (
                  SELECT practice_id FROM profiles WHERE user_id = auth.uid()
                )) OR
                appointment_id IN (
                    SELECT id FROM appointments 
                    WHERE therapist_id = auth.uid() OR patient_id = auth.uid()
                )
            );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'soap_notes' AND policyname = 'Therapists can update soap notes') THEN
            CREATE POLICY "Therapists can update soap notes" ON soap_notes
            FOR UPDATE USING (
                appointment_id IN (
                    SELECT id FROM appointments WHERE therapist_id = auth.uid()
                )
            );
        END IF;
    END IF;
END $$;
