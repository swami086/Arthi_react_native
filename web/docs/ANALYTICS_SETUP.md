# Analytics Setup

We use **Plausible Analytics** for privacy-focused usage tracking.

## Configuration

Set the following environment variables:
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`: The domain registered in Plausible (e.g., `safespace.com`).
- `NEXT_PUBLIC_PLAUSIBLE_API_HOST`: The API host (default `https://plausible.io`).
- `NEXT_PUBLIC_ENABLE_ANALYTICS`: Set to `true` to enable.

## Tracking Events

Use the `trackEvent` function from `@/lib/analytics`.

```typescript
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

trackEvent(AnalyticsEvents.SIGN_UP, { method: 'email' });
```

## Performance Monitoring (Web Vitals)

Core Web Vitals (LCP, CLS, INP) are automatically collected and sent to Rollbar as 'info' level logs.
- Controlled by `NEXT_PUBLIC_ENABLE_WEB_VITALS=true`.
- Implementation: `lib/web-vitals.ts`.
