# Rollbar Setup Guide

## Overview
This project uses [Rollbar](https://rollbar.com/) for error tracking and monitoring in both the React Native frontend and Supabase Edge Functions backend.

## Prerequisites
- A Rollbar account.
- Two Rollbar projects (recommended):
  1. `SafeSpaceApp-Frontend` (type: React Native)
  2. `SafeSpaceApp-Backend` (type: Node.js / Deno)

## Frontend Configuration

1. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your Rollbar details:
   ```bash
   ROLLBAR_ACCESS_TOKEN=your_frontend_post_client_item_token
   ROLLBAR_ENVIRONMENT=development # or production
   TRACE_SAMPLE_RATE=1.0 # Optional: 1.0 = 100%, 0.1 = 10%
   ```

2. **Usage**:
   Rollbar is initialized in `src/services/rollbar.ts`.
   
   To report an error manually:
   ```typescript
   import { reportError } from '../services/rollbar';
   
   try {
     // ... code
   } catch (error) {
     reportError(error, 'ContextName');
   }
   ```

3. **User Context**:
   The app automatically tracks the logged-in user.
   Use `setRollbarUser` and `clearRollbarUser` in `AuthContext.tsx`.

## Backend Configuration (Supabase Edge Functions)

1. **Secrets**:
   You must set the server-side access token as a Supabase secret. This token should have `post_server_item` scope.

   Run the following command in your terminal:
   ```bash
   supabase secrets set ROLLBAR_SERVER_ACCESS_TOKEN=your_backend_post_server_item_token ROLLBAR_ENVIRONMENT=production TRACE_SAMPLE_RATE=1.0
   ```

2. **Integration**:
   A shared Rollbar client is available in `supabase/functions/_shared/rollbar.ts`.
   
   Example usage in an Edge Function:
   ```typescript
   import { reportError } from '../_shared/rollbar.ts';
   
   try {
     // ... logic
   } catch (error) {
     reportError(error, 'function-name');
     // ... return error response
   }
   ```

## Verification

1. **Frontend**: Trigger a test error (e.g., throw a new Error in a button press) and verify it appears in the frontend Rollbar project dashboard.
2. **Backend**: Invoke an Edge Function that fails (or temporarily break one) and verify it appears in the backend Rollbar project dashboard.

## Uploading Source Maps (Optional but Recommended)
For better stack traces in production, configure your CI/CD pipeline to upload source maps to Rollbar. Refer to the [Rollbar React Native documentation](https://docs.rollbar.com/docs/react-native) for details.
