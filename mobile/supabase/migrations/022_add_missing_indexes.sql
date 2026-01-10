-- Admin Actions
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);

-- Appointments
CREATE INDEX IF NOT EXISTS idx_appointments_video_room_id ON appointments(video_room_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_practice_id ON notifications(practice_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Patient Goals
CREATE INDEX IF NOT EXISTS idx_patient_goals_patient_id ON patient_goals(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_goals_therapist_id ON patient_goals(therapist_id);

-- Patient Invitations
CREATE INDEX IF NOT EXISTS idx_patient_invitations_therapist_id ON patient_invitations(therapist_id);

-- Patient Referrals
CREATE INDEX IF NOT EXISTS idx_patient_referrals_patient_id ON patient_referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_referrals_referred_to_therapist_id ON patient_referrals(referred_to_therapist_id);
CREATE INDEX IF NOT EXISTS idx_patient_referrals_referring_therapist_id ON patient_referrals(referring_therapist_id);

-- Practice Invite Codes
CREATE INDEX IF NOT EXISTS idx_practice_invite_codes_created_by ON practice_invite_codes(created_by);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_approved_by ON profiles(approved_by);

-- Therapist Availability
CREATE INDEX IF NOT EXISTS idx_therapist_availability_therapist_id ON therapist_availability(therapist_id);

-- Therapist Notes
CREATE INDEX IF NOT EXISTS idx_therapist_notes_patient_id ON therapist_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_therapist_notes_therapist_id ON therapist_notes(therapist_id);

-- Therapist Patient Relationships
CREATE INDEX IF NOT EXISTS idx_therapist_patient_relationships_assigned_by ON therapist_patient_relationships(assigned_by);
