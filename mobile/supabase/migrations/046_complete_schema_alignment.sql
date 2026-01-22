-- Phase 1: Database Schema Completion (Priority: CRITICAL)

-- Step 1.1: Create Missing Tables

-- 1. patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    practice_id UUID REFERENCES public.practices(id) ON DELETE CASCADE,
    profile_id UUID UNIQUE REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    demographics JSONB DEFAULT '{}'::jsonb,
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    medications TEXT[] DEFAULT ARRAY[]::TEXT[],
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. sessions table (separate from appointments)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    practice_id UUID REFERENCES public.practices(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    audio_url TEXT,
    audio_duration_seconds INTEGER,
    status TEXT DEFAULT 'ongoing',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. biometrics table (partitioned by month)
CREATE TABLE IF NOT EXISTS public.biometrics (
    id UUID DEFAULT extensions.uuid_generate_v4(),
    patient_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    practice_id UUID REFERENCES public.practices(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL,
    value JSONB NOT NULL,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Initial partition for biometrics (Jan 2026)
CREATE TABLE IF NOT EXISTS public.biometrics_y2026m01 PARTITION OF public.biometrics
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- 4. consents table
CREATE TABLE IF NOT EXISTS public.consents (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    patient_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    practice_id UUID REFERENCES public.practices(id) ON DELETE CASCADE,
    abha_id TEXT,
    consent_id TEXT,
    purpose TEXT,
    status TEXT DEFAULT 'requested',
    granted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    consent_artifact JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    practice_id UUID REFERENCES public.practices(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 1.2: Add practice_id to Existing Tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'practice_id') THEN
        ALTER TABLE public.messages ADD COLUMN practice_id UUID REFERENCES public.practices(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'practice_id') THEN
        ALTER TABLE public.reviews ADD COLUMN practice_id UUID REFERENCES public.practices(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_goals' AND column_name = 'practice_id') THEN
        ALTER TABLE public.patient_goals ADD COLUMN practice_id UUID REFERENCES public.practices(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'therapist_notes' AND column_name = 'practice_id') THEN
        ALTER TABLE public.therapist_notes ADD COLUMN practice_id UUID REFERENCES public.practices(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patient_referrals' AND column_name = 'practice_id') THEN
        ALTER TABLE public.patient_referrals ADD COLUMN practice_id UUID REFERENCES public.practices(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'therapist_patient_relationships' AND column_name = 'practice_id') THEN
        ALTER TABLE public.therapist_patient_relationships ADD COLUMN practice_id UUID REFERENCES public.practices(id);
    END IF;
END $$;

-- Create indexes for practice isolation
CREATE INDEX IF NOT EXISTS idx_messages_practice ON public.messages(practice_id);
CREATE INDEX IF NOT EXISTS idx_reviews_practice ON public.reviews(practice_id);
CREATE INDEX IF NOT EXISTS idx_patient_goals_practice ON public.patient_goals(practice_id);
CREATE INDEX IF NOT EXISTS idx_therapist_notes_practice ON public.therapist_notes(practice_id);
CREATE INDEX IF NOT EXISTS idx_patient_referrals_practice ON public.patient_referrals(practice_id);
CREATE INDEX IF NOT EXISTS idx_therapist_patient_relationships_practice ON public.therapist_patient_relationships(practice_id);
CREATE INDEX IF NOT EXISTS idx_patients_practice ON public.patients(practice_id);
CREATE INDEX IF NOT EXISTS idx_sessions_practice ON public.sessions(practice_id);
CREATE INDEX IF NOT EXISTS idx_biometrics_practice ON public.biometrics(practice_id);
CREATE INDEX IF NOT EXISTS idx_consents_practice ON public.consents(practice_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_practice ON public.audit_logs(practice_id);

-- Step 1.3: Create Database Functions

CREATE OR REPLACE FUNCTION public.get_therapist_stats(therapist_user_id UUID)
RETURNS JSON AS $$
DECLARE
  practice_id_var UUID;
  result JSON;
BEGIN
  -- Authorization guard: only the therapist themselves or an admin can view these stats
  IF NOT (
    auth.uid() = therapist_user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND (is_super_admin = true OR role = 'admin')
    )
  ) THEN
    RAISE EXCEPTION 'Access denied. You are not authorized to view these statistics.';
  END IF;

  SELECT practice_id INTO practice_id_var FROM public.profiles WHERE user_id = therapist_user_id;
  
  SELECT json_build_object(
    'total_patients', (SELECT COUNT(*) FROM public.therapist_patient_relationships WHERE therapist_id = therapist_user_id AND status = 'active'),
    'active_sessions', (SELECT COUNT(*) FROM public.appointments WHERE therapist_id = therapist_user_id AND status = 'confirmed' AND start_time >= NOW()),
    'total_hours', (SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time))/3600), 0) FROM public.appointments WHERE therapist_id = therapist_user_id AND status = 'completed'),
    'rating', (SELECT COALESCE(AVG(rating), 5.0) FROM public.reviews WHERE therapist_id = therapist_user_id)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_practice_id()
RETURNS UUID AS $$
  SELECT practice_id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Step 1.4: Update RLS Policies

-- Enable RLS for new tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Add policies for practice isolation
DO $$
DECLARE
    table_name_var TEXT;
    tables_to_isolate TEXT[] := ARRAY['patients', 'sessions', 'biometrics', 'consents', 'messages', 'reviews', 'patient_goals', 'therapist_notes', 'patient_referrals', 'appointments', 'session_recordings', 'transcripts', 'soap_notes'];
BEGIN
    FOREACH table_name_var IN ARRAY tables_to_isolate
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "practice_isolation_select" ON public.%I', table_name_var);
        EXECUTE format('CREATE POLICY "practice_isolation_select" ON public.%I FOR SELECT USING (practice_id = public.current_practice_id())', table_name_var);
        
        EXECUTE format('DROP POLICY IF EXISTS "practice_isolation_insert" ON public.%I', table_name_var);
        EXECUTE format('CREATE POLICY "practice_isolation_insert" ON public.%I FOR INSERT WITH CHECK (practice_id = public.current_practice_id())', table_name_var);
        
        EXECUTE format('DROP POLICY IF EXISTS "practice_isolation_update" ON public.%I', table_name_var);
        EXECUTE format('CREATE POLICY "practice_isolation_update" ON public.%I FOR UPDATE USING (practice_id = public.current_practice_id())', table_name_var);
        
        EXECUTE format('DROP POLICY IF EXISTS "practice_isolation_delete" ON public.%I', table_name_var);
        EXECUTE format('CREATE POLICY "practice_isolation_delete" ON public.%I FOR DELETE USING (practice_id = public.current_practice_id())', table_name_var);
    END LOOP;
END $$;

-- Audit logs should be more restrictive (usually admin only or specific users)
DROP POLICY IF EXISTS "admin_read_audit_logs" ON public.audit_logs;
CREATE POLICY "admin_read_audit_logs" ON public.audit_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND (is_super_admin = true OR role IN ('admin', 'therapist')) -- Therapists might need to see their own practice's audit logs? No, plan says admin-only read access.
    )
);

-- Actually, let's stick to the plan: "admin-only read access"
DROP POLICY IF EXISTS "admin_read_audit_logs" ON public.audit_logs;
CREATE POLICY "admin_read_audit_logs" ON public.audit_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND (is_super_admin = true OR role = 'admin')
    )
);

-- Step 1.5: Create Audit Triggers

CREATE OR REPLACE FUNCTION public.log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
    practice_id_var UUID;
BEGIN
    -- Try to get practice_id from NEW if it exists, otherwise from OLD
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        BEGIN
            practice_id_var := NEW.practice_id;
        EXCEPTION WHEN OTHERS THEN
            practice_id_var := public.current_practice_id();
        END;
    ELSE
        BEGIN
            practice_id_var := OLD.practice_id;
        EXCEPTION WHEN OTHERS THEN
            practice_id_var := public.current_practice_id();
        END;
    END IF;

    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data, ip_address, practice_id)
    VALUES (
        auth.uid(), 
        TG_OP, 
        TG_TABLE_NAME, 
        COALESCE(
            CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
            NULL
        ), 
        CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END, 
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END, 
        inet_client_addr(),
        practice_id_var
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
DO $$
DECLARE
    table_name_var TEXT;
    sensitive_tables TEXT[] := ARRAY['session_recordings', 'soap_notes', 'patients', 'consents'];
BEGIN
    FOREACH table_name_var IN ARRAY sensitive_tables
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS audit_trigger ON public.%I', table_name_var);
        EXECUTE format('CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.log_audit_trail()', table_name_var);
    END LOOP;
END $$;
