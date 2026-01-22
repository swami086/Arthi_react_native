# Therapist Dashboard Audit & Fix Report

## Overview
This audit focused on the **Therapist Dashboard** (`/therapist/home`) and its critical user flows. Several critical UI/UX bugs were identified and fixed, while one backend blocker was isolated.

## 1. Resolved Issues

### ✅ Sign Out Functionality
- **Issue**: Users reported the "Sign Out" button was unreliable, sometimes failing to clear the session or redirecting incorrectly.
- **Root Cause**: The client-side `router.push('/login')` was executing before the Supabase session was fully invalidated, or state persisted due to client-side navigation.
- **Fix**: Replaced with `window.location.href = '/login'` to force a full browser reload. This ensures:
  1. Complete clearing of client-side state/cache.
  2. Middleware re-verification of the (now empty) session.
  3. Reliable redirection to the login page.
- **Status**: **Verified**.

### ✅ Onboarding Loop
- **Issue**: Skipping the "Welcome" onboarding step caused an infinite redirect loop between `/login` and `/onboarding/welcome`.
- **Root Cause**: The "Skip" button manually redirected to `/login`, but the Middleware detected `onboarding_completed=true` (which we just set) and redirected *authenticated* users back to `/therapist/home` (or sometimes back to onboarding if state wasn't synced).
- **Fix**: Changed redirect target to `/home` (or `/therapist/home`), allowing Middleware to route the user correctly based on their role.
- **Status**: **Verified**.

### ✅ Messaging Access & Routing
- **Issue**:
  1. Therapists were blocked from accessing `/messages` due to restrictive Middleware.
  2. The sidebar link pointed to `/messages`, which shared layout assumptions with the Patient dashboard.
- **Fixes**:
  1. **Middleware Update**: Explicitly allowed `/messages` and `/notifications` paths for the `therapist` role in `middleware.ts`.
  2. **Dedicated Route**: Created `web/app/therapist/messages/page.tsx` and `web/app/therapist/messages/[userId]/page.tsx`.
  3. **Sidebar Update**: Updated navigation link to point to `/therapist/messages`.
  4. **Component reuse**: Refactored `MessagesListClient` `ChatDetailClient` & `ChatHeader` to be reusable for both roles.
- **Status**: Code implemented. *Runtime verification requires server restart due to new routes.*

## 2. Critical Blocker

### ❌ New Patient Creation / Signup
- **Issue**: Creating a new Patient account (via Signup UI or seed script) fails with **500 Internal Server Error**.
- **Error**: `AuthApiError: Database error saving new user`.
- **Root Cause**: The Database Trigger `handle_new_user` (defined in `025_add_auth_trigger.sql`) is failing execution. This prevents the creation of the required `public.profiles` record linked to the `auth.users` record.
- **Impact**:
  - Cannot test "Add Patient" feature (requires existing patients).
  - Cannot fully test Messaging (requires participants).
- **Diagnostics**:
  - Authenticated User IS created in `auth.users`.
  - Transaction likely rolls back due to Trigger exception.
  - Suspected Schema Mismatch: The trigger attempts to insert columns (`role`, `full_name`, `avatar_url`) that might violate constraints or miss required columns (e.g., `email`) in the current production schema.

## 3. Next Steps
1.  **Backend Fix**: Investigate the `public.profiles` table definition in the remote Supabase instance.
    - Verify column constraints (NOT NULL) match the Trigger's insert statement.
    - Check Postgres logs for the specific PL/pgSQL error.
2.  **Restart Web Server**: To enable the new `/therapist/messages` routes.
3.  **Verify Add Patient**: Once Patient creation is fixed, verify the "Add Patient" discovery flow.

## 4. Current Environment State
- **Therapist User**: `test.mentor2@gmail.com` / `password123` (Functional).
- **Blocking**: No functionality to create `patient` role users.
