-- Migration 051: Backfill practice_id for existing rows
-- Ensures historical data aligned with the correct tenant

-- 0. Ensure column exists for payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS practice_id UUID REFERENCES public.practices(id);
ALTER TABLE public.payments ALTER COLUMN practice_id SET DEFAULT public.current_practice_id();

-- 0.1 Create a default practice if none exist to avoid backfill failure
DO $$
DECLARE
    default_practice_id UUID;
    first_user_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.practices) THEN
        -- Safely get a therapist or admin user to own the practice
        SELECT user_id INTO first_user_id FROM public.profiles WHERE role IN ('therapist', 'admin') LIMIT 1;
        
        IF first_user_id IS NOT NULL THEN
            INSERT INTO public.practices (name, slug, owner_user_id)
            VALUES ('Default Practice', 'default-practice', first_user_id)
            RETURNING id INTO default_practice_id;
            
            -- Assign all unassigned profiles to this practice
            UPDATE public.profiles SET practice_id = default_practice_id WHERE practice_id IS NULL;
        END IF;
    END IF;
    
    -- Ensure even if some practices existed, we assign unassigned profiles to THE first practice
    SELECT id INTO default_practice_id FROM public.practices LIMIT 1;
    IF default_practice_id IS NOT NULL THEN
        UPDATE public.profiles SET practice_id = default_practice_id WHERE practice_id IS NULL;
    END IF;
END $$;

-- 1. MESSAGES
UPDATE public.messages m
SET practice_id = p.practice_id
FROM public.profiles p
WHERE m.sender_id = p.user_id AND m.practice_id IS NULL;

-- 2. REVIEWS
UPDATE public.reviews r
SET practice_id = p.practice_id
FROM public.profiles p
WHERE r.therapist_id = p.user_id AND r.practice_id IS NULL;

-- 3. PATIENT_GOALS
UPDATE public.patient_goals g
SET practice_id = p.practice_id
FROM public.profiles p
WHERE g.patient_id = p.user_id AND g.practice_id IS NULL;

-- 4. THERAPIST_NOTES
UPDATE public.therapist_notes n
SET practice_id = p.practice_id
FROM public.profiles p
WHERE n.therapist_id = p.user_id AND n.practice_id IS NULL;

-- 5. PATIENT_REFERRALS
UPDATE public.patient_referrals ref
SET practice_id = p.practice_id
FROM public.profiles p
WHERE ref.referring_therapist_id = p.user_id AND ref.practice_id IS NULL;

-- 6. RELATIONSHIPS
UPDATE public.therapist_patient_relationships rel
SET practice_id = p.practice_id
FROM public.profiles p
WHERE rel.therapist_id = p.user_id AND rel.practice_id IS NULL;

-- 7. APPOINTMENTS
UPDATE public.appointments a
SET practice_id = p.practice_id
FROM public.profiles p
WHERE a.therapist_id = p.user_id AND a.practice_id IS NULL;

-- 8. SESSION_RECORDINGS
UPDATE public.session_recordings sr
SET practice_id = a.practice_id
FROM public.appointments a
WHERE sr.appointment_id = a.id AND sr.practice_id IS NULL;

-- 9. TRANSCRIPTS
UPDATE public.transcripts t
SET practice_id = sr.practice_id
FROM public.session_recordings sr
WHERE t.recording_id = sr.id AND t.practice_id IS NULL;

-- 10. SOAP_NOTES
UPDATE public.soap_notes sn
SET practice_id = a.practice_id
FROM public.appointments a
WHERE sn.appointment_id = a.id AND sn.practice_id IS NULL;

-- 11. PAYMENTS
UPDATE public.payments pay
SET practice_id = p.practice_id
FROM public.profiles p
WHERE pay.therapist_id = p.user_id AND pay.practice_id IS NULL;

-- 12. Enforce NOT NULL after backfill
-- Using DO block to check if column exists before enforcing (safety first)
DO $$
DECLARE
    table_name_var TEXT;
    tables_to_enforce TEXT[] := ARRAY['messages', 'reviews', 'patient_goals', 'therapist_notes', 'patient_referrals', 'therapist_patient_relationships', 'appointments', 'session_recordings', 'payments'];
BEGIN
    FOREACH table_name_var IN ARRAY tables_to_enforce
    LOOP
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN practice_id SET NOT NULL', table_name_var);
    END LOOP;
END $$;
