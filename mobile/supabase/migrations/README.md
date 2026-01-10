# Database Migrations for Multi-Tenant Architecture

## Overview
These migrations transform SafeSpaceApp from a single-tenant to a multi-tenant white-label SaaS platform.

## Migration Files

1. **001_create_practice_tables.sql** - Creates core practice tables
2. **002_add_practice_columns.sql** - Adds multi-tenant columns to existing tables
3. **003_enable_rls_policies.sql** - Implements Row-Level Security for data isolation
4. **004_create_practice_triggers.sql** - Auto-populates practice_id fields

## Applying Migrations

### Using Supabase CLI (Recommended)

```bash
# Apply all migrations
supabase db push

# Or apply individually
supabase db execute --file supabase/migrations/001_create_practice_tables.sql
supabase db execute --file supabase/migrations/002_add_practice_columns.sql
supabase db execute --file supabase/migrations/003_enable_rls_policies.sql
supabase db execute --file supabase/migrations/004_create_practice_triggers.sql
```

### Using Supabase Dashboard

1. Navigate to SQL Editor in Supabase Dashboard
2. Copy contents of each migration file
3. Execute in order (001 → 002 → 003 → 004)

## Verification

After applying migrations, verify with these queries:

```sql
-- Check practice tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('practices', 'practice_settings', 'practice_branding', 'practice_invite_codes');

-- Check practice_id columns added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'appointments', 'session_recordings', 'transcripts', 'soap_notes')
AND column_name = 'practice_id';

-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('practices', 'profiles', 'appointments', 'session_recordings');

-- Check triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## Rollback (Emergency Only)

If you need to rollback:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS trigger_set_appointment_practice_id ON appointments;
DROP TRIGGER IF EXISTS trigger_set_recording_practice_id ON session_recordings;
DROP TRIGGER IF EXISTS trigger_set_transcript_practice_id ON transcripts;
DROP TRIGGER IF EXISTS trigger_set_soap_note_practice_id ON soap_notes;

-- Drop functions
DROP FUNCTION IF EXISTS set_appointment_practice_id();
DROP FUNCTION IF EXISTS set_recording_practice_id();
DROP FUNCTION IF EXISTS set_transcript_practice_id();
DROP FUNCTION IF EXISTS set_soap_note_practice_id();

-- Remove practice_id columns
ALTER TABLE profiles DROP COLUMN IF EXISTS practice_id, DROP COLUMN IF EXISTS practice_role;
ALTER TABLE appointments DROP COLUMN IF EXISTS practice_id;
ALTER TABLE session_recordings DROP COLUMN IF EXISTS practice_id;
ALTER TABLE transcripts DROP COLUMN IF EXISTS practice_id;
ALTER TABLE soap_notes DROP COLUMN IF EXISTS practice_id;

-- Drop practice tables
DROP TABLE IF EXISTS practice_invite_codes;
DROP TABLE IF EXISTS practice_branding;
DROP TABLE IF EXISTS practice_settings;
DROP TABLE IF EXISTS practices;
```

## Important Notes

- **Backup First**: Always backup your database before applying migrations
- **Test Environment**: Apply to staging/development environment first
- **Existing Data**: Existing records will have `practice_id = NULL` until manually assigned
- **RLS Impact**: RLS policies may affect existing queries - test thoroughly
- **Rollbar**: All database operations maintain existing Rollbar instrumentation
