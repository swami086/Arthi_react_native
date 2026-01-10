-- Create check_is_admin function
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role = 'admin' FROM profiles WHERE user_id = auth.uid()),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE patient_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_splits ENABLE ROW LEVEL SECURITY;

-- Patient Referrals Policies
DROP POLICY IF EXISTS "Users can view their own referrals" ON patient_referrals;
CREATE POLICY "Users can view their own referrals" ON patient_referrals
FOR SELECT USING (
    patient_id = auth.uid() OR 
    referring_therapist_id = auth.uid() OR 
    referred_to_therapist_id = auth.uid()
);

DROP POLICY IF EXISTS "Therapists can create referrals" ON patient_referrals;
CREATE POLICY "Therapists can create referrals" ON patient_referrals
FOR INSERT WITH CHECK (referring_therapist_id = auth.uid());

-- Patient Invitations Policies
DROP POLICY IF EXISTS "Therapists can manage invitations" ON patient_invitations;
CREATE POLICY "Therapists can manage invitations" ON patient_invitations
FOR ALL USING (therapist_id = auth.uid());

-- Practices Policies
DROP POLICY IF EXISTS "Users can view their practice" ON practices;
CREATE POLICY "Users can view their practice" ON practices
FOR SELECT USING (
    id IN (SELECT practice_id FROM profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Practice owners can manage practice" ON practices;
CREATE POLICY "Practice owners can manage practice" ON practices
FOR ALL USING (owner_user_id = auth.uid());

-- Practice Settings Policies
DROP POLICY IF EXISTS "Practice members can view settings" ON practice_settings;
CREATE POLICY "Practice members can view settings" ON practice_settings
FOR SELECT USING (
    practice_id IN (SELECT practice_id FROM profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Practice owners can manage settings" ON practice_settings;
CREATE POLICY "Practice owners can manage settings" ON practice_settings
FOR ALL USING (
    practice_id IN (SELECT id FROM practices WHERE owner_user_id = auth.uid())
);

-- Admin Actions Policies
DROP POLICY IF EXISTS "Admins can view admin actions" ON admin_actions;
CREATE POLICY "Admins can view admin actions" ON admin_actions
FOR SELECT USING (check_is_admin());

DROP POLICY IF EXISTS "Admins can create admin actions" ON admin_actions;
CREATE POLICY "Admins can create admin actions" ON admin_actions
FOR INSERT WITH CHECK (admin_id = auth.uid() AND check_is_admin());

-- Practice Branding Policies
DROP POLICY IF EXISTS "Practice members can view branding" ON practice_branding;
CREATE POLICY "Practice members can view branding" ON practice_branding
FOR SELECT USING (
    practice_id IN (SELECT practice_id FROM profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Practice owners can manage branding" ON practice_branding;
CREATE POLICY "Practice owners can manage branding" ON practice_branding
FOR ALL USING (
    practice_id IN (SELECT id FROM practices WHERE owner_user_id = auth.uid())
);

-- Practice Invite Codes Policies
DROP POLICY IF EXISTS "Practice members can view invite codes" ON practice_invite_codes;
CREATE POLICY "Practice members can view invite codes" ON practice_invite_codes
FOR SELECT USING (
    practice_id IN (SELECT practice_id FROM profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Practice owners can manage invite codes" ON practice_invite_codes;
CREATE POLICY "Practice owners can manage invite codes" ON practice_invite_codes
FOR ALL USING (
    practice_id IN (SELECT id FROM practices WHERE owner_user_id = auth.uid())
);

-- Payment Splits Policies
DROP POLICY IF EXISTS "Users can view their payment splits" ON payment_splits;
CREATE POLICY "Users can view their payment splits" ON payment_splits
FOR SELECT USING (
    recipient_id = auth.uid() OR
    payment_id IN (SELECT id FROM payments WHERE patient_id = auth.uid() OR therapist_id = auth.uid())
);

-- 3. Fix Overly Permissive RLS Policy for session_recordings
-- Drop the permissive policy
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON session_recordings;
DROP POLICY IF EXISTS "Therapists can create recordings" ON session_recordings;

-- Recreate with proper check
CREATE POLICY "Therapists can create recordings" ON session_recordings
FOR INSERT WITH CHECK (
    therapist_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'therapist')
);
