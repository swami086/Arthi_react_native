# Error Handling & Observability in SafeSpace Web

## Overview

We use **Rollbar** for error tracking, **OpenTelemetry (Basic)** patterns for distributed tracing, and **Web Vitals** for performance monitoring. This setup ensures we catch errors across the client and server, trace requests end-to-end, and redact sensitive user data.

## Server-Side Error Handling

We use two primary wrappers to ensure consistent error handling:

### 1. Server Actions (`lib/server-action-wrapper.ts`)
Wrap all Server Actions with `withErrorHandling`.
- Captures errors and sends them to Rollbar.
- Filters out `NEXT_REDIRECT` errors.
- Adds trace IDs (`trace_id`) and span headers.
- Handles input validation with Zod.

**Usage:**
```typescript
export const myAction = withErrorHandling(
    'myContext.actionName',
    async (arg: MyType) => {
        // ... logic
    },
    MyZodSchema
);
```

### 2. API Routes (`lib/api-error-handler.ts`)
Wrap all API Route Handlers with `withApiErrorHandling`.
- Adds `x-request-id` and `x-trace-id` headers.
- Standardizes 500 error responses.
- Integrates with Rollbar.

**Usage:**
```typescript
import { withApiErrorHandling } from '@/lib/api-error-handler';
export const POST = withApiErrorHandling(async (req) => { ... });
```

## Client-Side Error Handling

### Error Boundary (`app/error.tsx`)
- Catches React rendering errors.
- Displays a user-friendly UI.
- Logs the error with `digest` to Rollbar.

### Global Error (`app/global-error.tsx`)
- Catches errors that bubble up to the root layout.
- Provides a last-resort UI to reload the app.

## Tracing

We use a manual distributed tracing implementation in `lib/rollbar-utils.ts`:
- **Trace ID**: Unique per request/session.
- **Span ID**: Unique per operation.
- **Span Stack**: Tracks nested operations.

To manually trace a block of code:
```typescript
import { startSpan, endSpan } from '@/lib/rollbar-utils';

startSpan('myOperation');
try {
    // ... work
} finally {
    endSpan();
}
```

## Data Privacy (DPDP Compliance)

All metadata sent to Rollbar is sanitized using `lib/metadata-sanitizer.ts`.
- **Redacted Fields**: password, token, credit_card, etc.
- **Circular References**: Handled automatically.
- **Depth Limit**: 5 levels deep.
