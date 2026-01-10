# Error Handling Guidelines

## Philosophy
We aim to capture all unhandled exceptions and relevant application errors to proactively identify and fix issues. We distinguish between "User Errors" (e.g., validation failed) and "System Errors" (e.g., database connection failed). System errors should always be reported to Rollbar.

## Instrumentation Strategy

### 1. Frontend (React Native) -> Rollbar
- **Global Errors**: Captured automatically by `rollbar-react-native`.
- **Navigation Errors**: Tracked via `AppNavigator` integration.
- **Service Layer**: All API calls in `src/api` and `src/services` are wrapped in try-catch blocks that call `reportError`.
- **Error Boundaries**: Critical screens (`VideoCall`, `Payment`, `Scribe`) are wrapped in `ErrorBoundary` components to prevent app-wide crashes and report the crash context.

### 2. Backend (Supabase Edge Functions) -> Rollbar
- **Function execution errors**: Captured in the usage of `reportError` in `catch` blocks.
- **Context**: Every error report includes the function name and relevant metadata (e.g., `appointmentId`, `fileSize`).
- **Privacy**: We explicitly **exclude** PII (Personally Identifiable Information) like passwords, tokens, and credit card numbers from error reports.

## Best Practices

1. **Always provide context**:
   ❌ `reportError(error)`
   ✅ `reportError(error, 'paymentService:processPayment', { amount: 100 })`

2. **Don't swallow errors silently**:
   If you catch an error, either handle it completely (recover) OR report it. Do not just `console.error` and ignore it.

3. **User Feedback**:
   When an error occurs, always provide feedback to the user (e.g., `Alert.alert` or a toast message), even if you reported it to Rollbar.

## Debugging
- Check the [Rollbar Dashboard](https://rollbar.com) for recent errors.
- Use the "Breadcrumbs" feature in Rollbar to see user actions leading up to an error.
- Filter by `environment` (development vs production) to isolate issues.
