-- Create the profiles table (foundational table required by all other migrations)
-- This table stores user profile information for therapists, patients, and admins
-- CRITICAL: This migration must run BEFORE all other migrations

CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary key: user_id references auth.users
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core user information
  role user_role NOT NULL,  -- Using existing ENUM type instead of VARCHAR
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  
  -- Therapist-specific fields
  expertise_areas TEXT[],
  years_of_experience INTEGER,
  specialization TEXT,
  is_available BOOLEAN DEFAULT true,
  rating_average NUMERIC(3, 2) DEFAULT 0.0,
  total_sessions INTEGER DEFAULT 0,
  therapist_bio_extended TEXT,
  certifications TEXT[],
  hourly_rate NUMERIC(10, 2),
  
  -- Approval workflow fields
  approval_status VARCHAR(20) CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approval_date TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  background_check_status VARCHAR(20) CHECK (background_check_status IN ('pending', 'completed', 'failed')),
  verification_documents TEXT[],
  rejection_reason TEXT,
  
  -- Admin fields
  is_super_admin BOOLEAN DEFAULT false,
  
  -- Practice management fields (will be populated by later migrations)
  practice_id UUID,
  practice_role VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_available ON public.profiles(is_available) WHERE role = 'therapist';
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles(approval_status) WHERE role = 'therapist';

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified to avoid infinite recursion)
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow anyone to read approved therapist profiles (for discovery)
CREATE POLICY "Public can read approved therapist profiles"
  ON public.profiles
  FOR SELECT
  USING (role = 'therapist' AND approval_status = 'approved');

-- Allow the trigger function to insert new profiles (bypass RLS)
CREATE POLICY "Allow trigger to insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE public.profiles IS 'User profiles for therapists, patients, and admins';
COMMENT ON COLUMN public.profiles.user_id IS 'References auth.users.id';
COMMENT ON COLUMN public.profiles.role IS 'User role: therapist, patient, or admin (ENUM type)';
COMMENT ON COLUMN public.profiles.approval_status IS 'Therapist approval status: pending, approved, or rejected';

