-- Restore missing practice schema and columns
-- Creates required tables and columns if they don't exist

-- 1. Create practices table
CREATE TABLE IF NOT EXISTS practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#4e8597',
  secondary_color VARCHAR(7) DEFAULT '#ffffff',
  accent_color VARCHAR(7) DEFAULT '#ff6b6b',
  description TEXT,
  website_url TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  subscription_tier VARCHAR(50) DEFAULT 'starter',
  subscription_status VARCHAR(50) DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for practices (IF NOT EXISTS not supported for CREATE INDEX standardly, doing manually)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_practices_owner') THEN
        CREATE INDEX idx_practices_owner ON practices(owner_user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_practices_slug') THEN
        CREATE INDEX idx_practices_slug ON practices(slug);
    END IF;
END $$;

-- 2. Create practice_settings
CREATE TABLE IF NOT EXISTS practice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  allow_patient_booking BOOLEAN DEFAULT true,
  require_therapist_approval BOOLEAN DEFAULT false,
  default_session_duration_minutes INTEGER DEFAULT 50,
  cancellation_policy_text TEXT,
  terms_of_service_url TEXT,
  privacy_policy_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(practice_id)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_practice_settings_practice') THEN
        CREATE INDEX idx_practice_settings_practice ON practice_settings(practice_id);
    END IF;
END $$;

-- 3. Create practice_branding
CREATE TABLE IF NOT EXISTS practice_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  logo_url TEXT,
  banner_image_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#4e8597',
  secondary_color VARCHAR(7) DEFAULT '#ffffff',
  accent_color VARCHAR(7) DEFAULT '#ff6b6b',
  font_family VARCHAR(100) DEFAULT 'system',
  custom_domain VARCHAR(255),
  favicon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(practice_id)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_practice_branding_practice') THEN
        CREATE INDEX idx_practice_branding_practice ON practice_branding(practice_id);
    END IF;
END $$;

-- 4. Create practice_invite_codes
CREATE TABLE IF NOT EXISTS practice_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invite_codes_practice') THEN
        CREATE INDEX idx_invite_codes_practice ON practice_invite_codes(practice_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invite_codes_code') THEN
        CREATE INDEX idx_invite_codes_code ON practice_invite_codes(code);
    END IF;
END $$;


-- 5. Add practice_id columns to existing tables

-- Profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'practice_id') THEN
    ALTER TABLE profiles ADD COLUMN practice_id UUID REFERENCES practices(id) ON DELETE SET NULL;
    CREATE INDEX idx_profiles_practice ON profiles(practice_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'practice_role') THEN
    ALTER TABLE profiles ADD COLUMN practice_role VARCHAR(50) DEFAULT 'therapist';
    CREATE INDEX idx_profiles_practice_role ON profiles(practice_id, practice_role);
    COMMENT ON COLUMN profiles.practice_role IS 'Role within practice: owner, admin, therapist, staff';
  END IF;
END $$;

-- Appointments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'practice_id') THEN
    ALTER TABLE appointments ADD COLUMN practice_id UUID REFERENCES practices(id) ON DELETE SET NULL;
    CREATE INDEX idx_appointments_practice ON appointments(practice_id);
  END IF;
END $$;

-- Session Recordings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_recordings' AND column_name = 'practice_id') THEN
    ALTER TABLE session_recordings ADD COLUMN practice_id UUID REFERENCES practices(id) ON DELETE SET NULL;
    CREATE INDEX idx_session_recordings_practice ON session_recordings(practice_id);
  END IF;
END $$;

-- Transcripts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transcripts' AND column_name = 'practice_id') THEN
    ALTER TABLE transcripts ADD COLUMN practice_id UUID REFERENCES practices(id) ON DELETE SET NULL;
    CREATE INDEX idx_transcripts_practice ON transcripts(practice_id);
  END IF;
END $$;

-- SOAP Notes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'soap_notes' AND column_name = 'practice_id') THEN
    ALTER TABLE soap_notes ADD COLUMN practice_id UUID REFERENCES practices(id) ON DELETE SET NULL;
    CREATE INDEX idx_soap_notes_practice ON soap_notes(practice_id);
  END IF;
END $$;
