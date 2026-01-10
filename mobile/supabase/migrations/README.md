# Database Migrations for Multi-Tenant Architecture & Rebranding

## Overview
These migrations transform SafeSpaceApp from a single-tenant to a multi-tenant white-label SaaS platform (TherapyFlow AI) and handle the terminology rebranding from Mentor/Mentee to Therapist/Patient.

## Migration Files

1. **001_create_practice_tables.sql** - Creates core practice tables
2. **002_add_practice_columns.sql** - Adds multi-tenant columns to existing tables
3. **003_enable_rls_policies.sql** - Implements Row-Level Security for data isolation
4. **004_create_practice_triggers.sql** - Auto-populates practice_id fields
5. **009_rebrand_mentor_to_therapist.sql** - Initial rebranding: Renames core tables and columns, updates ENUMs
6. **010_update_rls_policies.sql** - Updates RLS policies to use new "therapist/patient" terminology
7. **011_update_functions.sql** - Updates RPC functions (get_therapist_stats, etc.)
8. **012_update_triggers.sql** - Updates triggers for rebranded tables
9. **013_update_admin_stats_function.sql** - Updates admin stats RPC
10. **014_complete_rebranding.sql** - Completes rebranding for remaining tables (session_recordings, soap_notes, etc.) and updates their RLS policies
11. **015_update_practice_triggers.sql** - Updates appointment triggers to use therapist_id
12. **016_restore_practice_schema.sql** - Restores/Creates practice tables and columns if missing
13. **017_fix_rls_and_triggers.sql** - Updates RLS to include practice_id checks and ensures triggers are active
14. **018_soap_notes_therapist_id_fix.sql** - Renames mentor_id to therapist_id in soap_notes
15. **019_fix_profile_insert_policy.sql** - Fixes profile creation RLS during signup
16. **020_enable_rls_missing_tables.sql** - Enables RLS on all remaining tables
17. **021_consolidate_duplicate_policies.sql** - Consolidates duplicate RLS policies
18. **022_add_missing_indexes.sql** - Adds missing foreign key indexes
19. **023_fix_function_search_path.sql** - Hardens function security (SECURITY DEFINER + search_path)
20. **024_remove_unused_indexes.sql** - Removes unused indexes
21. **025_add_auth_trigger.sql** - Adds auth trigger for profile creation

## Applying Migrations

### Using Supabase CLI (Recommended)

```bash
# Apply all migrations
supabase db push

# Or apply by pushing local changes
# Note: Ensure you are in the correct directory
```

### Using Supabase Dashboard

1. Navigate to SQL Editor in Supabase Dashboard
2. Copy contents of each migration file
3. Execute in order

## Verification

After applying migrations, verify with these queries:

```sql
-- Check practice tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('practices', 'practice_settings', 'practice_branding', 'practice_invite_codes');

-- Check for rebranded columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('session_recordings', 'soap_notes', 'appointments')
AND column_name IN ('therapist_id', 'patient_id', 'edited_by_therapist');

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

If you need to rollback, check the `*_rollback.sql` files (if created) or manually reverse the `ALTER TABLE` and `CREATE POLICY` statements.

## Important Notes

- **Backup First**: Always backup your database before applying migrations
- **Test Environment**: Apply to staging/development environment first
- **Existing Data**: Existing records will have `practice_id = NULL` until manually assigned
- **RLS Impact**: RLS policies may affect existing queries - test thoroughly
- **Rollbar**: All database operations maintain existing Rollbar instrumentation
