-- Drop old functions
DROP FUNCTION IF EXISTS get_mentor_stats(uuid);
DROP FUNCTION IF EXISTS get_mentee_list_for_mentor(uuid);
DROP FUNCTION IF EXISTS get_mentor_relationships(uuid);

-- Create new functions

-- get_therapist_stats
CREATE OR REPLACE FUNCTION get_therapist_stats(therapist_user_id UUID)
RETURNS TABLE (
  total_patients BIGINT,
  total_sessions BIGINT,
  upcoming_sessions BIGINT,
  pending_requests BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT count(*) FROM therapist_patient_relationships WHERE therapist_id = therapist_user_id AND status = 'active') as total_patients,
    (SELECT count(*) FROM appointments WHERE therapist_id = therapist_user_id AND status = 'completed') as total_sessions,
    (SELECT count(*) FROM appointments WHERE therapist_id = therapist_user_id AND status = 'confirmed' AND start_time > NOW()) as upcoming_sessions,
    (SELECT count(*) FROM therapist_patient_relationships WHERE therapist_id = therapist_user_id AND status = 'pending') as pending_requests;
END;
$$;

-- get_patient_list_for_therapist
CREATE OR REPLACE FUNCTION get_patient_list_for_therapist(therapist_user_id UUID)
RETURNS TABLE (
  patient_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  last_appointment_date TIMESTAMPTZ,
  last_appointment_status TEXT,
  status TEXT,
  relationship_status TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id as patient_id,
    p.full_name,
    p.avatar_url,
    (SELECT start_time FROM appointments a WHERE a.patient_id = p.user_id AND a.therapist_id = therapist_user_id ORDER BY start_time DESC LIMIT 1) as last_appointment_date,
    (SELECT a.status FROM appointments a WHERE a.patient_id = p.user_id AND a.therapist_id = therapist_user_id ORDER BY start_time DESC LIMIT 1) as last_appointment_status,
    r.status as status,
    r.status as relationship_status
  FROM therapist_patient_relationships r
  JOIN profiles p ON r.patient_id = p.user_id
  WHERE r.therapist_id = therapist_user_id;
END;
$$;

-- get_therapist_relationships
CREATE OR REPLACE FUNCTION get_therapist_relationships(therapist_id_input UUID)
RETURNS SETOF therapist_patient_relationships LANGUAGE sql AS $$
  SELECT * FROM therapist_patient_relationships WHERE therapist_id = therapist_id_input;
$$;
