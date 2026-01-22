-- Fix triggers and RLS policies for stable signup flow

-- 1. Fix handle_new_user search_path security and ensure it returns correct trigger result
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, full_name, avatar_url, created_at)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient'::user_role),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 2. Fix create_default_agent_preferences search_path security
CREATE OR REPLACE FUNCTION create_default_agent_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_agent_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 3. Update RLS policies for user_agent_preferences to allow trigger insertion
-- Drop the existing restrictive policy if it exists
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_agent_preferences;

-- Create granular policies
DROP POLICY IF EXISTS "Users can read own preferences" ON user_agent_preferences;
CREATE POLICY "Users can read own preferences"
  ON user_agent_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_agent_preferences;
CREATE POLICY "Users can update own preferences"
  ON user_agent_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own preferences" ON user_agent_preferences;
CREATE POLICY "Users can delete own preferences"
  ON user_agent_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow trigger to insert (bypass RLS for INSERT)
DROP POLICY IF EXISTS "Allow trigger to insert preferences" ON user_agent_preferences;
CREATE POLICY "Allow trigger to insert preferences"
  ON user_agent_preferences
  FOR INSERT
  WITH CHECK (true);
