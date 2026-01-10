-- Drop conflicting policies first
DROP POLICY IF EXISTS "Users can read mentor profiles" ON profiles;
DROP POLICY IF EXISTS "Mentors can read their mentees" ON profiles;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;

-- Rename tables
ALTER TABLE mentor_mentee_relationships RENAME TO therapist_patient_relationships;
ALTER TABLE mentee_referrals RENAME TO patient_referrals;
ALTER TABLE mentee_invitations RENAME TO patient_invitations;
ALTER TABLE mentee_goals RENAME TO patient_goals;
ALTER TABLE mentor_notes RENAME TO therapist_notes;

-- Rename columns in therapist_patient_relationships
ALTER TABLE therapist_patient_relationships RENAME COLUMN mentor_id TO therapist_id;
ALTER TABLE therapist_patient_relationships RENAME COLUMN mentee_id TO patient_id;

-- Rename columns in patient_referrals
ALTER TABLE patient_referrals RENAME COLUMN mentee_id TO patient_id;
ALTER TABLE patient_referrals RENAME COLUMN referring_mentor_id TO referring_therapist_id;
ALTER TABLE patient_referrals RENAME COLUMN referred_to_mentor_id TO referred_to_therapist_id;

-- Rename columns in patient_invitations
ALTER TABLE patient_invitations RENAME COLUMN mentor_id TO therapist_id;
ALTER TABLE patient_invitations RENAME COLUMN mentee_email TO patient_email;
ALTER TABLE patient_invitations RENAME COLUMN mentee_name TO patient_name;

-- Rename columns in patient_goals
ALTER TABLE patient_goals RENAME COLUMN mentee_id TO patient_id;
ALTER TABLE patient_goals RENAME COLUMN mentor_id TO therapist_id;

-- Rename columns in therapist_notes
ALTER TABLE therapist_notes RENAME COLUMN mentor_id TO therapist_id;
ALTER TABLE therapist_notes RENAME COLUMN mentee_id TO patient_id;

-- Rename columns in appointments
ALTER TABLE appointments RENAME COLUMN mentor_id TO therapist_id;
ALTER TABLE appointments RENAME COLUMN mentee_id TO patient_id;

-- Rename columns in reviews
ALTER TABLE reviews RENAME COLUMN mentor_id TO therapist_id;
ALTER TABLE reviews RENAME COLUMN mentee_id TO patient_id;

-- Rename columns in payments
ALTER TABLE payments RENAME COLUMN mentor_id TO therapist_id;
ALTER TABLE payments RENAME COLUMN mentee_id TO patient_id;

-- Rename columns in video_rooms
ALTER TABLE video_rooms RENAME COLUMN mentor_token TO therapist_token;
ALTER TABLE video_rooms RENAME COLUMN mentee_token TO patient_token;

-- Update profiles role enum values (requires recreating the enum)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ALTER COLUMN role TYPE TEXT;
UPDATE profiles SET role = 'therapist' WHERE role = 'mentor';
UPDATE profiles SET role = 'patient' WHERE role = 'mentee';
CREATE TYPE user_role AS ENUM ('therapist', 'patient', 'admin');
ALTER TABLE profiles ALTER COLUMN role TYPE user_role USING role::user_role;

-- Update admin_actions action_type enum
ALTER TABLE admin_actions DROP CONSTRAINT IF EXISTS admin_actions_action_type_check;
ALTER TABLE admin_actions ALTER COLUMN action_type TYPE TEXT;
UPDATE admin_actions SET action_type = 'approve_therapist' WHERE action_type = 'approve_mentor';
UPDATE admin_actions SET action_type = 'reject_therapist' WHERE action_type = 'reject_mentor';
UPDATE admin_actions SET action_type = 'assign_patient' WHERE action_type = 'assign_mentee';
CREATE TYPE admin_action_type AS ENUM ('create_admin', 'approve_therapist', 'reject_therapist', 'assign_patient');
ALTER TABLE admin_actions ALTER COLUMN action_type TYPE admin_action_type USING action_type::admin_action_type;

-- Update profile column names
ALTER TABLE profiles RENAME COLUMN mentor_bio_extended TO therapist_bio_extended;
