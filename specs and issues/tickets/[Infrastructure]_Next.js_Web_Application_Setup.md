# [Infrastructure] Next.js Web Application Setup

## Overview
Initialize the Next.js 15 web application with App Router, TypeScript, Tailwind CSS, and Supabase integration.

## Context
Reference: `spec:df06a57d-bbce-4623-8e1c-cd129f15f2cf/9205213b-7551-4266-99b1-915e78111a8d` (Frontend Web Implementation)

The web application serves as the primary interface for therapists to manage their practice, conduct sessions, and access AI-powered insights.

## Technical Requirements

### 1. Project Initialization
```bash
npx create-next-app@latest therapyflow-web --typescript --tailwind --app --src-dir
```

### 2. Dependencies Installation
```json
{
  "@supabase/ssr": "^0.5.2",
  "@supabase/supabase-js": "^2.45.4",
  "zustand": "^4.5.0",
  "react-hook-form": "^7.53.0",
  "zod": "^3.23.8",
  "@tanstack/react-query": "^5.59.0",
  "recharts": "^2.13.0",
  "date-fns": "^4.1.0",
  "lucide-react": "^0.454.0",
  "sonner": "^1.7.1"
}
```

### 3. Project Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── sessions/
│   │   ├── billing/
│   │   └── settings/
│   └── api/
├── components/
│   ├── ui/
│   ├── auth/
│   ├── dashboard/
│   └── shared/
├── lib/
│   ├── supabase/
│   ├── utils/
│   └── hooks/
├── types/
└── styles/
```

### 4. Supabase Client Configuration
Set up server and client-side Supabase clients using SSR package for proper cookie handling.

### 5. Environment Configuration
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Middleware Setup
Configure Next.js middleware for authentication checks and route protection.

### 7. Tailwind Configuration
- Set up custom color palette matching brand guidelines
- Configure responsive breakpoints
- Add custom animations for loading states

### 8. TypeScript Configuration
- Enable strict mode
- Configure path aliases (@/ for src/)
- Set up type definitions for Supabase tables

## Acceptance Criteria
- [ ] Next.js 15 project initialized with App Router
- [ ] All dependencies installed and configured
- [ ] Project structure created following spec
- [ ] Supabase client configured for SSR
- [ ] Environment variables set up
- [ ] Middleware configured for auth
- [ ] Tailwind CSS customized with brand colors
- [ ] TypeScript strict mode enabled
- [ ] Development server runs without errors
- [ ] ESLint and Prettier configured

## Dependencies
- Requires: Supabase Project Setup ticket completion

## Estimated Effort
3-4 hours