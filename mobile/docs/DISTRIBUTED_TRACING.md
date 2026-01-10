# Distributed Tracing with Rollbar

This document describes the distributed tracing implementation in SafeSpaceApp, which links frontend user actions with backend Supabase Edge Function execution for comprehensive debugging.

## Overview

Distributed tracing allows us to follow a request from the mobile app through various backend services. By assigning a unique `trace_id` to a user session and a `span_id` to individual operations, we can correlate logs and errors across the entire stack in Rollbar.

## Core Concepts

- **Trace ID**: A unique identifier for a logical operation or user session. Persistent until reset (e.g., on login/logout).
- **Span ID**: A unique identifier for a specific unit of work (e.g., an API call, a complex computation).
- **Trace Chain**: An array of parent span IDs, representing the hierarchy of operations.

## Frontend Implementation (`src/services/rollbar.ts`)

The frontend Rollbar service provides utilities for trace management:

- `getTraceId()`: Returns the current trace ID.
- `resetTraceId()`: Regenerates the trace ID (used on login/logout).
- `startSpan(name)` / `endSpan()`: Manages hierarchical spans.
- `withRollbarTrace(headers)`: Adds `X-Rollbar-Trace-Id` and `X-Rollbar-Span-Id` to request headers.
- `reportError`, `reportInfo`, `reportWarning`: Automatically include trace and span context in payloads.

### Usage Example

```typescript
import { withRollbarTrace, reportError } from '../services/rollbar';

try {
  const { data, error } = await supabase.functions.invoke('my-function', {
    body: { foo: 'bar' },
    headers: withRollbarTrace()
  });
  if (error) throw error;
} catch (err) {
  reportError(err, 'MyComponent:myFunction');
}
```

## Backend Implementation (`supabase/functions/_shared/rollbar.ts`)

Backend functions extract the trace context from incoming requests and include it in their own Rollbar reports.

- `extractTraceContext(req)`: Utility to get `traceId` and `spanId` from headers.
- `reportError`, `reportInfo`, `reportWarning`: Accept `trace_id` and `span_id` in metadata.

### Usage Example

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { reportError, extractTraceContext } from '../_shared/rollbar.ts'

serve(async (req) => {
    const { traceId, spanId } = extractTraceContext(req);
    
    try {
        // ... logic ...
    } catch (error) {
        await reportError(error, 'my-function', { 
            trace_id: traceId, 
            span_id: spanId 
        });
    }
});
```

## Performance Monitoring

Utilities are available to track duration of operations:

- `startTimer(name)`: Starts a timer.
- `endTimer(name, context, metadata)`: Stops the timer and reports the duration to Rollbar.

## Trace Sampling

The `TRACE_SAMPLE_RATE` environment variable controls the percentage of traces that are recorded. Use `shouldTrace()` to check if the current operation should be traced.

## Visualization in Rollbar

To see the distributed trace:
1. Open an item in Rollbar.
2. Look for `trace_id` and `span_id` in the Occurrence details.
3. Search for the same `trace_id` in Rollbar to see all linked events across frontend and backend.
