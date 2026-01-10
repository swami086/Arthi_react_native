# [Backend] Audit Logging System Implementation

## Overview
Implement comprehensive audit logging system to track all data access and modifications for compliance with DPDP Act and healthcare regulations.

## Context
Reference: `spec:df06a57d-bbce-4623-8e1c-cd129f15f2cf/b4037edb-59e9-4001-b90c-a3700ed5e98e` (Compliance & Security)

Audit logs are critical for regulatory compliance, security monitoring, and forensic analysis in case of data breaches.

## Technical Requirements

### 1. Audit Log Table Schema
```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL, -- 'CREATE', 'READ', 'UPDATE', 'DELETE'
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_audit_org_time ON audit_logs(org_id, created_at DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_table ON audit_logs(table_name, created_at DESC);
```

### 2. Automatic Audit Triggers
Create triggers for sensitive tables:
```sql
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (org_id, user_id, action, table_name, record_id, old_data)
    VALUES (OLD.org_id, auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (org_id, user_id, action, table_name, record_id, old_data, new_data)
    VALUES (NEW.org_id, auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (org_id, user_id, action, table_name, record_id, new_data)
    VALUES (NEW.org_id, auth.uid(), 'CREATE', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to sensitive tables
CREATE TRIGGER audit_patients
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_clinical_notes
  AFTER INSERT OR UPDATE OR DELETE ON clinical_notes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_sessions
  AFTER INSERT OR UPDATE OR DELETE ON sessions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

### 3. Manual Audit Logging Helper
Create Edge Function helper for explicit audit logging:
```typescript
// lib/audit.ts
export async function logAudit(params: {
  orgId: string;
  userId: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  tableName: string;
  recordId: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert(params);
  
  if (error) console.error('Audit log failed:', error);
}
```

### 4. Read Access Logging
Log sensitive data access (e.g., viewing patient records):
```typescript
// In patient detail page
useEffect(() => {
  logAudit({
    orgId: user.orgId,
    userId: user.id,
    action: 'READ',
    tableName: 'patients',
    recordId: patientId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
}, [patientId]);
```

### 5. Audit Log Viewer (Admin Dashboard)
Create admin interface to view and filter audit logs:
- Filter by date range
- Filter by user
- Filter by action type
- Filter by table
- Export to CSV for compliance reports

### 6. Retention Policy
Implement automatic archival:
```sql
-- Archive logs older than 7 years to cold storage
CREATE TABLE audit_logs_archive (LIKE audit_logs);

-- Scheduled job (pg_cron)
SELECT cron.schedule(
  'archive-old-audit-logs',
  '0 2 * * 0', -- Weekly at 2 AM
  $$
  INSERT INTO audit_logs_archive 
  SELECT * FROM audit_logs 
  WHERE created_at < now() - interval '7 years';
  
  DELETE FROM audit_logs 
  WHERE created_at < now() - interval '7 years';
  $$
);
```

### 7. Alerting for Suspicious Activity
Create Edge Function to detect anomalies:
- Multiple failed login attempts
- Bulk data exports
- Access from unusual IP addresses
- After-hours access to sensitive data

## Acceptance Criteria
- [ ] Audit log table created with indexes
- [ ] Automatic triggers created for all sensitive tables
- [ ] Manual audit logging helper implemented
- [ ] Read access logging implemented for patient records
- [ ] Audit log viewer created in admin dashboard
- [ ] Filtering and search functionality working
- [ ] CSV export functionality implemented
- [ ] Retention policy configured (7 years)
- [ ] Archival job scheduled
- [ ] Suspicious activity detection implemented
- [ ] Alert notifications configured
- [ ] Performance impact assessed (< 5ms overhead)

## Dependencies
- Requires: Database Schema Implementation
- Requires: Authentication System Implementation

## Estimated Effort
6-7 hours