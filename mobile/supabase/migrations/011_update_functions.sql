-- Rename and update get_mentor_stats -> get_therapist_stats
CREATE OR REPLACE FUNCTION get_therapist_stats(therapist_user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_patients INTEGER; -- renamed from total_mentees
  active_patients INTEGER; -- renamed from active_mentees
  total_sessions INTEGER;
  total_earnings NUMERIC;
  upcoming_sessions INTEGER;
  pending_requests INTEGER;
BEGIN
  -- Validate user role
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = therapist_user_id AND role = 'therapist') THEN
    RAISE EXCEPTION 'User is not a therapist';
  END IF;

  -- Get total patients associated
  SELECT COUNT(*) INTO total_patients
  FROM therapist_patient_relationships
  WHERE therapist_id = therapist_user_id AND status = 'active';

  -- Get active patients (e.g., accessed app in last 30 days - simplifed logic)
  SELECT COUNT(*) INTO active_patients
  FROM therapist_patient_relationships
  WHERE therapist_id = therapist_user_id AND status = 'active';

  -- Get total completed sessions
  SELECT COUNT(*) INTO total_sessions
  FROM appointments
  WHERE therapist_id = therapist_user_id AND status = 'completed';

  -- Get total earnings (sum of payments)
  SELECT COALESCE(SUM(amount), 0) INTO total_earnings
  FROM payments
  WHERE therapist_id = therapist_user_id AND status = 'succeeded';

  -- Get upcoming sessions
  SELECT COUNT(*) INTO upcoming_sessions
  FROM appointments
  WHERE therapist_id = therapist_user_id 
    AND status = 'confirmed' 
    AND start_time >= NOW();

  -- Get pending requests
  SELECT COUNT(*) INTO pending_requests
  FROM therapist_patient_relationships
  WHERE therapist_id = therapist_user_id AND status = 'pending';

  RETURN json_build_object(
    'total_patients', total_patients,
    'active_patients', active_patients,
    'total_sessions', total_sessions,
    'total_earnings', total_earnings,
    'upcoming_sessions', upcoming_sessions,
    'pending_requests', pending_requests
  );
END;
$$;

-- Rename and update get_mentee_list_for_mentor -> get_patient_list_for_therapist
CREATE OR REPLACE FUNCTION get_patient_list_for_therapist(therapist_user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'user_id', p.user_id,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url,
      'status', tpr.status,
      'last_session_date', (
        SELECT MAX(start_time) FROM appointments a 
        WHERE a.patient_id = p.user_id AND a.therapist_id = therapist_user_id AND a.status = 'completed'
      )
    )
  ) INTO result
  FROM therapist_patient_relationships tpr
  JOIN profiles p ON tpr.patient_id = p.user_id
  WHERE tpr.therapist_id = therapist_user_id;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Rename and update get_mentor_relationships -> get_therapist_relationships
CREATE OR REPLACE FUNCTION get_therapist_relationships(therapist_id_input UUID)
RETURNS SETOF therapist_patient_relationships
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM therapist_patient_relationships WHERE therapist_id = therapist_id_input;
$$;

-- Drop old functions
DROP FUNCTION IF EXISTS get_mentor_stats(UUID);
DROP FUNCTION IF EXISTS get_mentee_list_for_mentor(UUID);
DROP FUNCTION IF EXISTS get_mentor_relationships(UUID);
