-- Rename and update get_admin_dashboard_stats Function to use new terminology
DROP FUNCTION IF EXISTS get_admin_dashboard_stats();
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_therapists INTEGER;
  pending_approvals INTEGER;
  total_patients INTEGER;
  total_admins INTEGER;
BEGIN
  -- Count only approved therapists as 'active'
  SELECT COUNT(*) INTO active_therapists FROM profiles WHERE role = 'therapist' AND approval_status = 'approved';
  
  -- Count only pending therapists
  SELECT COUNT(*) INTO pending_approvals FROM profiles WHERE role = 'therapist' AND approval_status = 'pending';
  
  -- Count patients
  SELECT COUNT(*) INTO total_patients FROM profiles WHERE role = 'patient';
  
  -- Count admins
  SELECT COUNT(*) INTO total_admins FROM profiles WHERE role = 'admin';
  
  RETURN json_build_object(
    'active_therapists', active_therapists,
    'pending_approvals', pending_approvals,
    'total_patients', total_patients, -- Changed from total_mentees
    'total_admins', total_admins
  );
END;
$$;
