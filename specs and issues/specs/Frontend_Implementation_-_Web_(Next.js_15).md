# Frontend Implementation - Web (Next.js 15)

# Frontend Implementation - Web (Next.js 15)

## Overview

The web application is built with Next.js 15 using the App Router, Server Components, and Server Actions. It targets therapists using desktop/laptop devices for clinical workflows.

## Project Structure

```
web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── patients/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── appointments/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── sessions/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── record/
│   │   │   │       └── page.tsx
│   │   │   └── notes/
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── webhooks/
│   │       └── supabase/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/  # shadcn/ui components
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── stats-cards.tsx
│   ├── patients/
│   │   ├── patient-list.tsx
│   │   ├── patient-form.tsx
│   │   └── patient-card.tsx
│   ├── sessions/
│   │   ├── audio-recorder.tsx
│   │   ├── note-editor.tsx
│   │   └── soap-note-viewer.tsx
│   └── shared/
│       ├── loading-spinner.tsx
│       └── error-boundary.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts  # Client Component client
│   │   ├── server.ts  # Server Component client
│   │   └── middleware.ts
│   ├── actions/  # Server Actions
│   │   ├── auth.ts
│   │   ├── patients.ts
│   │   ├── appointments.ts
│   │   └── sessions.ts
│   ├── hooks/
│   │   ├── use-user.ts
│   │   ├── use-patients.ts
│   │   └── use-realtime.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── date.ts
│   │   └── validation.ts
│   └── types/
│       └── database.types.ts  # Generated from Supabase
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## Authentication Flow

### Login Page Wireframe

```wireframe
<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
body { background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
.container { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 40px; max-width: 400px; width: 100%; }
.logo { text-align: center; margin-bottom: 32px; }
.logo-text { font-size: 24px; font-weight: 700; color: #2563eb; }
.form-group { margin-bottom: 20px; }
label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #374151; }
input { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
input:focus { outline: none; border-color: #2563eb; }
.button { width: 100%; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; margin-top: 8px; }
.button:hover { background: #1d4ed8; }
.link { text-align: center; margin-top: 16px; font-size: 14px; color: #6b7280; }
.link a { color: #2563eb; text-decoration: none; }
.divider { margin: 24px 0; text-align: center; color: #9ca3af; font-size: 14px; }
.oauth-button { width: 100%; padding: 12px; background: white; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; cursor: pointer; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; }
.oauth-button:hover { background: #f9fafb; }
</style>
</head>
<body>
<div class="container">
  <div class="logo">
    <div class="logo-text">TherapyFlow AI</div>
    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Practice Management for Therapists</div>
  </div>
  
  <form data-element-id="login-form">
    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" id="email" placeholder="therapist@example.com" data-element-id="email-input" />
    </div>
    
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" id="password" placeholder="••••••••" data-element-id="password-input" />
    </div>
    
    <div style="text-align: right; margin-bottom: 16px;">
      <a href="#" style="font-size: 14px; color: #2563eb; text-decoration: none;" data-element-id="forgot-password">Forgot password?</a>
    </div>
    
    <button type="submit" class="button" data-element-id="login-button">Sign In</button>
  </form>
  
  <div class="divider">OR</div>
  
  <button class="oauth-button" data-element-id="google-login">
    <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
    Continue with Google
  </button>
  
  <div class="link">
    Don't have an account? <a href="#" data-element-id="signup-link">Sign up</a>
  </div>
</div>
</body>
</html>
```

### Authentication Implementation

```typescript
// app/(auth)/login/page.tsx
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage() {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return <LoginForm />
}
```

```typescript
// components/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmail, signInWithGoogle } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await signInWithEmail(formData)
    
    if (result.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="therapist@example.com"
        />
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>
      
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => signInWithGoogle()}
      >
        Continue with Google
      </Button>
    </form>
  )
}
```

```typescript
// lib/actions/auth.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export async function signInWithEmail(formData: FormData) {
  const supabase = await createServerClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signInWithGoogle() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect(data.url)
}

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
```

## Dashboard Layout

### Dashboard Wireframe

```wireframe
<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
body { background: #f5f5f5; }
.layout { display: flex; min-height: 100vh; }
.sidebar { width: 240px; background: white; border-right: 1px solid #e5e7eb; padding: 20px; }
.logo { font-size: 18px; font-weight: 700; color: #2563eb; margin-bottom: 32px; }
.nav-item { padding: 12px 16px; margin-bottom: 4px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 12px; color: #374151; font-size: 14px; }
.nav-item:hover { background: #f3f4f6; }
.nav-item.active { background: #eff6ff; color: #2563eb; font-weight: 500; }
.main { flex: 1; }
.header { background: white; border-bottom: 1px solid #e5e7eb; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; }
.header-title { font-size: 20px; font-weight: 600; color: #111827; }
.user-menu { display: flex; align-items: center; gap: 12px; }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: 500; color: #6b7280; }
.content { padding: 32px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
.stat-card { background: white; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb; }
.stat-label { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
.stat-value { font-size: 28px; font-weight: 700; color: #111827; }
.stat-change { font-size: 12px; color: #10b981; margin-top: 4px; }
.section { background: white; border-radius: 8px; padding: 24px; border: 1px solid #e5e7eb; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-title { font-size: 16px; font-weight: 600; color: #111827; }
.button-primary { padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; }
.button-primary:hover { background: #1d4ed8; }
.appointment-item { padding: 16px; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
.appointment-item:last-child { border-bottom: none; }
.appointment-time { font-size: 14px; color: #6b7280; }
.appointment-patient { font-size: 14px; font-weight: 500; color: #111827; margin-top: 4px; }
.badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
.badge-scheduled { background: #dbeafe; color: #1e40af; }
</style>
</head>
<body>
<div class="layout">
  <aside class="sidebar">
    <div class="logo">TherapyFlow AI</div>
    <nav>
      <div class="nav-item active" data-element-id="nav-dashboard">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
        Dashboard
      </div>
      <div class="nav-item" data-element-id="nav-patients">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
        Patients
      </div>
      <div class="nav-item" data-element-id="nav-appointments">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>
        Appointments
      </div>
      <div class="nav-item" data-element-id="nav-sessions">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
        Sessions
      </div>
      <div class="nav-item" data-element-id="nav-settings">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
        Settings
      </div>
    </nav>
  </aside>
  
  <div class="main">
    <header class="header">
      <div class="header-title">Dashboard</div>
      <div class="user-menu">
        <button class="button-primary" data-element-id="new-appointment">+ New Appointment</button>
        <div class="avatar" data-element-id="user-avatar">DT</div>
      </div>
    </header>
    
    <div class="content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Today's Appointments</div>
          <div class="stat-value">8</div>
          <div class="stat-change">+2 from yesterday</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active Patients</div>
          <div class="stat-value">142</div>
          <div class="stat-change">+5 this week</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Pending Notes</div>
          <div class="stat-value">3</div>
          <div class="stat-change">Needs approval</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Hours Saved (AI)</div>
          <div class="stat-value">24</div>
          <div class="stat-change">This month</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-header">
          <div class="section-title">Upcoming Appointments</div>
          <button class="button-primary" data-element-id="view-all">View All</button>
        </div>
        
        <div class="appointment-item" data-element-id="appointment-1">
          <div>
            <div class="appointment-time">Today, 10:00 AM - 11:00 AM</div>
            <div class="appointment-patient">Rahul Sharma</div>
          </div>
          <span class="badge badge-scheduled">Scheduled</span>
        </div>
        
        <div class="appointment-item" data-element-id="appointment-2">
          <div>
            <div class="appointment-time">Today, 2:00 PM - 3:00 PM</div>
            <div class="appointment-patient">Priya Patel</div>
          </div>
          <span class="badge badge-scheduled">Scheduled</span>
        </div>
        
        <div class="appointment-item" data-element-id="appointment-3">
          <div>
            <div class="appointment-time">Tomorrow, 11:00 AM - 12:00 PM</div>
            <div class="appointment-patient">Amit Kumar</div>
          </div>
          <span class="badge badge-scheduled">Scheduled</span>
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>
```

### Dashboard Implementation

```typescript
// app/(dashboard)/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { UpcomingAppointments } from '@/components/dashboard/upcoming-appointments'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch dashboard data in parallel
  const [statsData, appointmentsData] = await Promise.all([
    supabase.rpc('get_dashboard_stats'),
    supabase
      .from('appointments')
      .select('*, patient:patients(*), therapist:profiles(*)')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(5)
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.user_metadata.name}
        </p>
      </div>

      <StatsCards data={statsData.data} />
      <UpcomingAppointments appointments={appointmentsData.data} />
    </div>
  )
}
```

## Session Recording & Note Generation

### Recording Interface Wireframe

```wireframe
<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
body { background: #f5f5f5; padding: 20px; }
.container { max-width: 800px; margin: 0 auto; }
.header { background: white; border-radius: 8px; padding: 24px; margin-bottom: 20px; border: 1px solid #e5e7eb; }
.patient-info { display: flex; justify-content: space-between; align-items: center; }
.patient-name { font-size: 20px; font-weight: 600; color: #111827; }
.session-time { font-size: 14px; color: #6b7280; margin-top: 4px; }
.badge { padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; background: #dcfce7; color: #166534; }
.recorder { background: white; border-radius: 8px; padding: 40px; text-align: center; border: 1px solid #e5e7eb; margin-bottom: 20px; }
.waveform { height: 80px; background: linear-gradient(to right, #e5e7eb 0%, #e5e7eb 50%, #e5e7eb 100%); border-radius: 4px; margin: 24px 0; display: flex; align-items: center; justify-content: center; color: #9ca3af; }
.timer { font-size: 48px; font-weight: 700; color: #111827; margin-bottom: 24px; }
.controls { display: flex; gap: 16px; justify-content: center; }
.button { padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; display: flex; align-items: center; gap: 8px; }
.button-record { background: #dc2626; color: white; }
.button-record:hover { background: #b91c1c; }
.button-pause { background: #f59e0b; color: white; }
.button-stop { background: #6b7280; color: white; }
.button-stop:hover { background: #4b5563; }
.notes-section { background: white; border-radius: 8px; padding: 24px; border: 1px solid #e5e7eb; }
.section-title { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 16px; }
.note-field { margin-bottom: 20px; }
.note-label { font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px; display: block; }
.note-textarea { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; min-height: 100px; resize: vertical; }
.note-textarea:focus { outline: none; border-color: #2563eb; }
.ai-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: #eff6ff; color: #1e40af; border-radius: 4px; font-size: 12px; font-weight: 500; margin-left: 8px; }
.button-primary { padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
.button-primary:hover { background: #1d4ed8; }
.button-secondary { padding: 12px 24px; background: white; color: #374151; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
.button-secondary:hover { background: #f9fafb; }
.actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="patient-info">
      <div>
        <div class="patient-name">Rahul Sharma</div>
        <div class="session-time">Session started at 10:00 AM</div>
      </div>
      <span class="badge">In Progress</span>
    </div>
  </div>
  
  <div class="recorder">
    <div class="timer" data-element-id="timer">00:15:32</div>
    <div class="waveform" data-element-id="waveform">
      Audio waveform visualization
    </div>
    <div class="controls">
      <button class="button button-pause" data-element-id="pause-button">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
        Pause
      </button>
      <button class="button button-stop" data-element-id="stop-button">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd"/></svg>
        Stop & Generate Note
      </button>
    </div>
  </div>
  
  <div class="notes-section">
    <div class="section-title">
      Session Notes (SOAP Format)
      <span class="ai-badge">
        <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/></svg>
        AI Generated
      </span>
    </div>
    
    <div class="note-field">
      <label class="note-label" for="subjective">Subjective (Patient's Report)</label>
      <textarea id="subjective" class="note-textarea" data-element-id="subjective-input" placeholder="Patient reported feeling anxious about upcoming exams...">Patient reported increased anxiety levels over the past week, particularly related to upcoming board exams. Mentions difficulty sleeping (4-5 hours per night) and racing thoughts. Reports using breathing exercises learned in previous session with moderate success.</textarea>
    </div>
    
    <div class="note-field">
      <label class="note-label" for="objective">Objective (Observations & Data)</label>
      <textarea id="objective" class="note-textarea" data-element-id="objective-input" placeholder="Patient appeared restless, fidgeting...">Patient appeared restless during session, frequent fidgeting. Speech rate elevated. HRV data from wearable shows 15% decrease on Tuesday (correlates with reported work stress). Sleep duration averaged 4.5 hours over past 7 days (down from 6.5 hours baseline).</textarea>
    </div>
    
    <div class="note-field">
      <label class="note-label" for="assessment">Assessment (Clinical Impression)</label>
      <textarea id="assessment" class="note-textarea" data-element-id="assessment-input" placeholder="Generalized Anxiety Disorder (GAD)...">Generalized Anxiety Disorder (GAD) with acute exacerbation related to academic stressors. Sleep deprivation contributing to symptom severity. Patient demonstrates good insight and motivation for treatment. Biometric data supports subjective reports.</textarea>
    </div>
    
    <div class="note-field">
      <label class="note-label" for="plan">Plan (Treatment & Interventions)</label>
      <textarea id="plan" class="note-textarea" data-element-id="plan-input" placeholder="Continue CBT techniques...">1. Continue CBT techniques focusing on cognitive restructuring for exam-related thoughts
2. Introduce progressive muscle relaxation for sleep hygiene
3. Recommend sleep schedule: 11 PM - 6 AM (7 hours target)
4. Follow-up in 1 week to assess progress
5. Consider short-term anxiolytic if symptoms worsen (discuss with psychiatrist)</textarea>
    </div>
    
    <div class="note-field">
      <label class="note-label" for="icd-codes">ICD-10 Codes</label>
      <input type="text" id="icd-codes" class="note-textarea" style="min-height: auto;" data-element-id="icd-codes-input" value="F41.1 (Generalized Anxiety Disorder), G47.00 (Insomnia, unspecified)" />
    </div>
    
    <div class="actions">
      <button class="button-secondary" data-element-id="save-draft">Save as Draft</button>
      <button class="button-primary" data-element-id="approve-note">Approve & Finalize</button>
    </div>
  </div>
</div>
</body>
</html>
```

### Recording Implementation

```typescript
// components/sessions/audio-recorder.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { uploadAudio, generateNote } from '@/lib/actions/sessions'
import { toast } from 'sonner'

export function AudioRecorder({ sessionId }: { sessionId: string }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(1000) // Collect data every second
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      toast.error('Failed to access microphone')
      console.error(error)
    }
  }

  function pauseRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  function resumeRecording() {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    }
  }

  async function stopRecording() {
    if (!mediaRecorderRef.current) return

    setIsProcessing(true)

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        
        // Upload audio to Supabase Storage
        const formData = new FormData()
        formData.append('audio', audioBlob, `session-${sessionId}.webm`)
        formData.append('sessionId', sessionId)
        formData.append('duration', duration.toString())

        const result = await uploadAudio(formData)

        if (result.error) {
          toast.error(result.error)
          setIsProcessing(false)
          return
        }

        // Trigger AI note generation
        toast.success('Audio uploaded. Generating note...')
        const noteResult = await generateNote(sessionId)

        if (noteResult.error) {
          toast.error(noteResult.error)
        } else {
          toast.success('Note generated! Review and approve.')
        }

        setIsProcessing(false)
        resolve()
      }

      mediaRecorderRef.current!.stop()
      mediaRecorderRef.current!.stream.getTracks().forEach((track) => track.stop())
      if (timerRef.current) clearInterval(timerRef.current)
    })
  }

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl font-bold mb-4">{formatDuration(duration)}</div>
        
        {/* Waveform visualization placeholder */}
        <div className="h-20 bg-muted rounded-lg flex items-center justify-center mb-6">
          <span className="text-muted-foreground">Audio waveform</span>
        </div>

        <div className="flex gap-4 justify-center">
          {!isRecording ? (
            <Button onClick={startRecording} size="lg">
              Start Recording
            </Button>
          ) : (
            <>
              {!isPaused ? (
                <Button onClick={pauseRecording} variant="outline" size="lg">
                  Pause
                </Button>
              ) : (
                <Button onClick={resumeRecording} variant="outline" size="lg">
                  Resume
                </Button>
              )}
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Stop & Generate Note'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

```typescript
// lib/actions/sessions.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadAudio(formData: FormData) {
  const supabase = await createServerClient()
  
  const audioFile = formData.get('audio') as File
  const sessionId = formData.get('sessionId') as string
  const duration = parseInt(formData.get('duration') as string)

  // Upload to Supabase Storage
  const fileName = `${sessionId}-${Date.now()}.webm`
  const { data, error } = await supabase.storage
    .from('session-audio')
    .upload(fileName, audioFile, {
      contentType: 'audio/webm',
      upsert: false,
    })

  if (error) {
    return { error: error.message }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('session-audio')
    .getPublicUrl(fileName)

  // Update session record
  await supabase
    .from('sessions')
    .update({
      audio_url: publicUrl,
      audio_duration_seconds: duration,
      status: 'completed',
      end_time: new Date().toISOString(),
    })
    .eq('id', sessionId)

  revalidatePath(`/sessions/${sessionId}`)
  return { success: true, audioUrl: publicUrl }
}

export async function generateNote(sessionId: string) {
  const supabase = await createServerClient()

  // Get session data
  const { data: session } = await supabase
    .from('sessions')
    .select('*, appointment:appointments(*, patient:patients(*))')
    .eq('id', sessionId)
    .single()

  if (!session?.audio_url) {
    return { error: 'No audio file found' }
  }

  // Call Edge Function to process audio
  const { data, error } = await supabase.functions.invoke('transcribe-and-generate-note', {
    body: {
      sessionId,
      audioUrl: session.audio_url,
      patientId: session.appointment.patient_id,
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/sessions/${sessionId}/notes`)
  return { success: true, noteId: data.noteId }
}
```

## Real-time Updates

```typescript
// lib/hooks/use-realtime.ts
'use client'

import { useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function useRealtimeAppointments(practiceId: string) {
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `practice_id=eq.${practiceId}`,
        },
        (payload) => {
          console.log('Appointment change:', payload)
          router.refresh() // Refresh Server Components
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [practiceId, router, supabase])
}
```

## Performance Optimization

### Image Optimization

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // For audio uploads
    },
  },
}

export default nextConfig
```

### Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const AudioRecorder = dynamic(
  () => import('@/components/sessions/audio-recorder'),
  {
    loading: () => <div>Loading recorder...</div>,
    ssr: false, // Client-only component
  }
)

const NoteEditor = dynamic(
  () => import('@/components/sessions/note-editor'),
  {
    loading: () => <div>Loading editor...</div>,
  }
)
```

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

```typescript
// __tests__/components/audio-recorder.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AudioRecorder } from '@/components/sessions/audio-recorder'

// Mock MediaRecorder
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  state: 'inactive',
  ondataavailable: null,
  onstop: null,
}))

describe('AudioRecorder', () => {
  it('should start recording when button clicked', async () => {
    render(<AudioRecorder sessionId="test-session" />)
    
    const startButton = screen.getByText('Start Recording')
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument()
    })
  })

  it('should format duration correctly', () => {
    render(<AudioRecorder sessionId="test-session" />)
    expect(screen.getByText('00:00:00')).toBeInTheDocument()
  })
})
```

### E2E Tests (Playwright)

```typescript
// e2e/session-recording.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Session Recording Flow', () => {
  test('should record session and generate note', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[data-element-id="email-input"]', 'therapist@test.com')
    await page.fill('[data-element-id="password-input"]', 'password')
    await page.click('[data-element-id="login-button"]')

    // Navigate to session
    await page.goto('/sessions/test-session-id/record')

    // Start recording
    await page.click('text=Start Recording')
    await expect(page.locator('text=Pause')).toBeVisible()

    // Wait 5 seconds
    await page.waitForTimeout(5000)

    // Stop recording
    await page.click('text=Stop & Generate Note')

    // Wait for note generation
    await expect(page.locator('text=AI Generated')).toBeVisible({ timeout: 30000 })

    // Verify SOAP sections are populated
    await expect(page.locator('[data-element-id="subjective-input"]')).not.toBeEmpty()
    await expect(page.locator('[data-element-id="objective-input"]')).not.toBeEmpty()
  })
})
```

## Deployment

### Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NEXT_TELEMETRY_DISABLED = "1"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "microphone=(self)"
```

### Environment Variables (Netlify)

```bash
# Production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
NEXT_PUBLIC_SITE_URL=https://therapyflow.ai
```

## Next Steps

1. **Setup Project**: Initialize Next.js 15 with TypeScript + Tailwind
2. **Install Dependencies**: Supabase client, shadcn/ui, React Hook Form, Zod
3. **Configure Auth**: Implement Supabase Auth with cookie-based SSR
4. **Build Dashboard**: Implement layout, sidebar, stats cards
5. **Patient Management**: CRUD operations with Server Actions
6. **Appointment Scheduling**: Calendar view with real-time updates
7. **Session Recording**: MediaRecorder API integration
8. **AI Integration**: Connect to Edge Functions for transcription/notes
9. **Testing**: Unit tests + E2E tests
10. **Deploy**: Netlify with CI/CD pipeline