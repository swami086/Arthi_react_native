---
id: "b5c6d7fc-e560-4003-a180-522b60576b49"
title: "Wave 6 Implementation: Integration & DevOps - API Integrations, Analytics, Caching & CI/CD"
assignee: ""
status: 0
createdAt: "1768117374572"
updatedAt: "1768117595818"
type: ticket
---

# Wave 6 Implementation: Integration & DevOps - API Integrations, Analytics, Caching & CI/CD

# Wave 6: Integration & DevOps

**Duration:** 1.5 weeks  
**Team Size:** 2-3 developers  
**Prerequisites:** Wave 1-5 complete

## Overview

Implement API integrations, PostHog analytics, caching layer for cost optimization, and CI/CD pipeline for automated deployments.

## Dependencies

**Must Complete First:**
- All previous waves (1-5)

**Related Tickets:**
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/691129ea-ffb8-4fb5-a003-42982e3ce350` (OpenAI & Anthropic Integration)
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/3e18600b-b724-4169-82b3-8b2d9adbb9c0` (PostHog Analytics)
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/289dd6e7-2363-4d2a-9677-278d77e00e11` (Caching Layer)
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/6b506cb3-fe7a-46cc-9cb2-0831544ae45b` (CI/CD Pipeline)

---

## STEP 1: Enhanced LLM Integration with Fallback

### 1.1 Update LLM Client with Circuit Breaker

**File:** `file:mobile/supabase/functions/_shared/llm-client.ts`

```typescript
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

export class LLMClient {
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private readonly FAILURE_THRESHOLD = 5;
  private readonly TIMEOUT_MS = 30000;
  private readonly RESET_TIMEOUT_MS = 60000;

  async chat(options: ChatOptions): Promise<ChatResponse> {
    const providers = [
      { name: 'anthropic', model: options.model },
      { name: 'openai', model: 'gpt-5.2' }, // Fallback
    ];

    for (const provider of providers) {
      const breakerState = this.getCircuitBreakerState(provider.name);

      // Skip if circuit is open
      if (breakerState.state === 'open') {
        const timeSinceFailure = Date.now() - breakerState.lastFailureTime;
        if (timeSinceFailure < this.RESET_TIMEOUT_MS) {
          console.log(`Circuit breaker open for ${provider.name}, skipping`);
          continue;
        } else {
          // Try half-open
          breakerState.state = 'half-open';
        }
      }

      try {
        const response = await this.callProvider(provider.name, provider.model, options);
        
        // Success - reset circuit breaker
        this.resetCircuitBreaker(provider.name);
        
        return response;
      } catch (error) {
        // Record failure
        this.recordFailure(provider.name);
        
        console.error(`Provider ${provider.name} failed:`, error);
        
        // Continue to next provider
        continue;
      }
    }

    throw new Error('All LLM providers failed');
  }

  private getCircuitBreakerState(provider: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(provider)) {
      this.circuitBreakers.set(provider, {
        failures: 0,
        lastFailureTime: 0,
        state: 'closed',
      });
    }
    return this.circuitBreakers.get(provider)!;
  }

  private recordFailure(provider: string): void {
    const state = this.getCircuitBreakerState(provider);
    state.failures++;
    state.lastFailureTime = Date.now();

    if (state.failures >= this.FAILURE_THRESHOLD) {
      state.state = 'open';
      console.warn(`Circuit breaker opened for ${provider} after ${state.failures} failures`);
    }
  }

  private resetCircuitBreaker(provider: string): void {
    const state = this.getCircuitBreakerState(provider);
    state.failures = 0;
    state.state = 'closed';
  }

  private async callProvider(provider: string, model: string, options: ChatOptions): Promise<ChatResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      if (provider === 'anthropic') {
        return await this.callAnthropic(model, options, controller.signal);
      } else if (provider === 'openai') {
        return await this.callOpenAI(model, options, controller.signal);
      }
      throw new Error(`Unknown provider: ${provider}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  // ... existing callAnthropic and callOpenAI methods
}
```

---

## STEP 2: PostHog Analytics Integration

### 2.1 Install PostHog

```bash
# Web
cd web
pnpm add posthog-js

# Mobile
cd mobile
npx expo install posthog-react-native expo-file-system expo-application expo-device expo-localization
```

### 2.2 Configure PostHog (Web)

**File:** `file:web/lib/posthog.ts`

```typescript
import posthog from 'posthog-js';

export function initPostHog() {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug();
      },
      capture_pageview: false, // We'll capture manually
      capture_pageleave: true,
      autocapture: false, // Manual tracking for HIPAA compliance
    });
  }
}

export { posthog };
```

**File:** `file:web/app/layout.tsx`

```typescript
import { initPostHog } from '@/lib/posthog';
import { PostHogProvider } from 'posthog-js/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  initPostHog();

  return (
    <html lang="en">
      <body>
        <PostHogProvider client={posthog}>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
```

### 2.3 Track Events (Web)

**File:** `file:web/lib/analytics.ts`

```typescript
import { posthog } from './posthog';

export const analytics = {
  // User events
  identifyUser(userId: string, properties?: Record<string, any>) {
    posthog.identify(userId, properties);
  },

  // Agent events
  trackAgentInteraction(agentType: string, intent: string, duration: number) {
    posthog.capture('agent_interaction', {
      agent_type: agentType,
      intent,
      duration_ms: duration,
    });
  },

  // Chat events
  trackChatMessage(role: 'user' | 'assistant', messageLength: number) {
    posthog.capture('chat_message', {
      role,
      message_length: messageLength,
    });
  },

  // Booking events
  trackAppointmentBooked(therapistId: string, date: string) {
    posthog.capture('appointment_booked', {
      therapist_id: therapistId,
      appointment_date: date,
    });
  },

  // Feature usage
  trackFeatureUsed(featureName: string, properties?: Record<string, any>) {
    posthog.capture('feature_used', {
      feature_name: featureName,
      ...properties,
    });
  },

  // Page views
  trackPageView(pageName: string) {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      page_name: pageName,
    });
  },
};
```

### 2.4 Configure PostHog (Mobile)

**File:** `file:mobile/src/services/analyticsService.ts`

```typescript
import PostHog from 'posthog-react-native';

let posthogClient: PostHog | null = null;

export async function initAnalytics() {
  posthogClient = await PostHog.initAsync(
    process.env.EXPO_PUBLIC_POSTHOG_KEY!,
    {
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    }
  );
}

export const analytics = {
  identifyUser(userId: string, properties?: Record<string, any>) {
    posthogClient?.identify(userId, properties);
  },

  trackAgentInteraction(agentType: string, intent: string, duration: number) {
    posthogClient?.capture('agent_interaction', {
      agent_type: agentType,
      intent,
      duration_ms: duration,
    });
  },

  trackChatMessage(role: 'user' | 'assistant', messageLength: number) {
    posthogClient?.capture('chat_message', {
      role,
      message_length: messageLength,
    });
  },

  trackScreenView(screenName: string) {
    posthogClient?.screen(screenName);
  },

  trackFeatureUsed(featureName: string, properties?: Record<string, any>) {
    posthogClient?.capture('feature_used', {
      feature_name: featureName,
      ...properties,
    });
  },
};
```

---

## STEP 3: Caching Layer for Cost Optimization

### 3.1 Create Redis-Compatible Cache (Upstash)

**File:** `file:mobile/supabase/functions/_shared/cache-service.ts`

```typescript
import { Redis } from 'https://esm.sh/@upstash/redis@1.20.1';

export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: Deno.env.get('UPSTASH_REDIS_URL')!,
      token: Deno.env.get('UPSTASH_REDIS_TOKEN')!,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value as T | null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  generateCacheKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}
```

### 3.2 Implement Response Caching

**File:** `file:mobile/supabase/functions/_shared/cached-llm-client.ts`

```typescript
import { LLMClient, ChatOptions, ChatResponse } from './llm-client.ts';
import { CacheService } from './cache-service.ts';
import crypto from 'https://deno.land/std@0.177.0/node/crypto.ts';

export class CachedLLMClient extends LLMClient {
  private cache: CacheService;
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(cache: CacheService) {
    super();
    this.cache = cache;
  }

  async chat(options: ChatOptions): Promise<ChatResponse> {
    // Generate cache key from options
    const cacheKey = this.generateCacheKey(options);

    // Check cache
    const cached = await this.cache.get<ChatResponse>(cacheKey);
    if (cached) {
      console.log('Cache hit for LLM request');
      return {
        ...cached,
        cached: true,
      };
    }

    // Call LLM
    const response = await super.chat(options);

    // Cache response (only for deterministic queries)
    if (options.temperature <= 0.3) {
      await this.cache.set(cacheKey, response, this.CACHE_TTL);
    }

    return response;
  }

  private generateCacheKey(options: ChatOptions): string {
    // Create hash of options
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature,
        tools: options.tools,
      }))
      .digest('hex');

    return this.cache.generateCacheKey('llm', hash);
  }
}
```

### 3.3 Cache RAG Embeddings

Update `file:mobile/supabase/functions/_shared/embedding-service.ts`:

```typescript
import { CacheService } from './cache-service.ts';

export class EmbeddingService {
  private cache: CacheService;

  constructor(openaiKey: string, cache: CacheService) {
    this.openaiKey = openaiKey;
    this.cache = cache;
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    // Generate cache key
    const cacheKey = this.cache.generateCacheKey('embedding', text);

    // Check cache
    const cached = await this.cache.get<EmbeddingResult>(cacheKey);
    if (cached) {
      console.log('Cache hit for embedding');
      return cached;
    }

    // Generate embedding
    const result = await this.callOpenAIEmbedding(text);

    // Cache for 7 days (embeddings are deterministic)
    await this.cache.set(cacheKey, result, 7 * 24 * 3600);

    return result;
  }

  // ... rest of methods
}
```

---

## STEP 4: CI/CD Pipeline

### 4.1 GitHub Actions for Web (Vercel)

**File:** `file:.github/workflows/web-deploy.yml`

```yaml
name: Deploy Web to Vercel

on:
  push:
    branches: [main, staging]
    paths:
      - 'web/**'
      - '.github/workflows/web-deploy.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        working-directory: ./web
        run: pnpm install

      - name: Run tests
        working-directory: ./web
        run: pnpm test

      - name: Build
        working-directory: ./web
        run: pnpm build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./web
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
```

### 4.2 GitHub Actions for Mobile (EAS)

**File:** `file:.github/workflows/mobile-build.yml`

```yaml
name: Build Mobile App

on:
  push:
    branches: [main, staging]
    paths:
      - 'mobile/**'
      - '.github/workflows/mobile-build.yml'

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        platform: [ios, android]
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        working-directory: ./mobile
        run: npm install

      - name: Build ${{ matrix.platform }}
        working-directory: ./mobile
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            eas build --platform ${{ matrix.platform }} --profile production --non-interactive
          else
            eas build --platform ${{ matrix.platform }} --profile preview --non-interactive
          fi
```

### 4.3 GitHub Actions for Supabase Functions

**File:** `file:.github/workflows/supabase-deploy.yml`

```yaml
name: Deploy Supabase Functions

on:
  push:
    branches: [main, staging]
    paths:
      - 'mobile/supabase/functions/**'
      - '.github/workflows/supabase-deploy.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x

      - name: Install Supabase CLI
        run: |
          curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
          sudo mv supabase /usr/local/bin/

      - name: Deploy Functions
        working-directory: ./mobile/supabase
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
        run: |
          supabase functions deploy --project-ref $SUPABASE_PROJECT_ID

      - name: Run Migrations
        working-directory: ./mobile/supabase
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
        run: |
          supabase db push --project-ref $SUPABASE_PROJECT_ID
```

### 4.4 Configure EAS Build Profiles

**File:** `file:mobile/eas.json`

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

---

## STEP 5: Monitoring & Alerting

### 5.1 Setup Uptime Monitoring

**File:** `file:.github/workflows/uptime-check.yml`

```yaml
name: Uptime Check

on:
  schedule:
    - cron: '*/5 * * * *' # Every 5 minutes

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Web App
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://your-app.vercel.app)
          if [ $response -ne 200 ]; then
            echo "Web app is down! Status: $response"
            exit 1
          fi

      - name: Check API
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://your-project.supabase.co/functions/v1/health)
          if [ $response -ne 200 ]; then
            echo "API is down! Status: $response"
            exit 1
          fi

      - name: Notify on Failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Uptime check failed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## SUCCESS CRITERIA

### API Integrations
- ✅ Circuit breaker prevents cascading failures
- ✅ Automatic fallback to backup provider
- ✅ Timeout handling works correctly
- ✅ Error rates < 1%

### Analytics
- ✅ PostHog tracks all key events
- ✅ User identification works
- ✅ Event properties are accurate
- ✅ HIPAA-compliant (no PII in events)

### Caching
- ✅ LLM responses cached for deterministic queries
- ✅ Embeddings cached for 7 days
- ✅ Cache hit rate > 30%
- ✅ Cost reduction > 25%

### CI/CD
- ✅ Automated deployments on push to main
- ✅ Tests run before deployment
- ✅ Mobile builds complete successfully
- ✅ Supabase functions deploy automatically
- ✅ Rollback capability available

---

## COST OPTIMIZATION RESULTS

```sql
-- Query to measure cache effectiveness
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_requests,
  SUM(CASE WHEN cached = true THEN 1 ELSE 0 END) as cached_requests,
  ROUND(SUM(CASE WHEN cached = true THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as cache_hit_rate,
  SUM(CASE WHEN cached = false THEN cost_usd ELSE 0 END) as actual_cost,
  SUM(cost_usd) as would_be_cost_without_cache,
  ROUND((1 - SUM(CASE WHEN cached = false THEN cost_usd ELSE 0 END) / SUM(cost_usd)) * 100, 2) as cost_savings_percent
FROM agent_executions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## NEXT WAVE PREVIEW

**Wave 7** will implement:
- Onboarding flows for AI features
- E2E testing with Playwright
- HIPAA compliance audit
- Comprehensive documentation

**Estimated Duration:** 1.5 weeks
