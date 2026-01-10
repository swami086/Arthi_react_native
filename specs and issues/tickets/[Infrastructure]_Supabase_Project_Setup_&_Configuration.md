# [Infrastructure] Supabase Project Setup & Configuration

## Overview
Set up the Supabase project as the backend infrastructure for TherapyFlow AI + BioSync, including database, authentication, storage, and Edge Functions.

## Context
Reference: `spec:df06a57d-bbce-4623-8e1c-cd129f15f2cf/7908b42c-2ce4-4d34-b8de-fb6ce905a7b6` (System Architecture)
Reference: `spec:df06a57d-bbce-4623-8e1c-cd129f15f2cf/ac8fa530-233d-4e59-a7a2-9affe9e328b0` (Database Schema)

Supabase serves as the unified backend providing PostgreSQL database, authentication, real-time subscriptions, storage, and serverless Edge Functions.

## Technical Requirements

### 1. Project Creation
- Create new Supabase project in **Mumbai (ap-south-1)** region for data residency compliance
- Configure project name: `therapyflow-production`
- Set up organization billing for Pro tier features

### 2. Database Configuration
- Enable PostGIS extension for location-based features
- Enable pg_cron for scheduled tasks
- Enable pgvector for AI embeddings (future RAG implementation)
- Configure connection pooling (PgBouncer) for scalability

### 3. Authentication Setup
- Enable Email/Password authentication
- Configure email templates for verification, password reset
- Set up JWT expiry: 1 hour (access token), 30 days (refresh token)
- Configure redirect URLs for web and mobile apps
- Enable MFA support for therapist accounts

### 4. Storage Buckets
Create the following storage buckets:
- `session-recordings`: Audio files (private, 90-day retention)
- `profile-images`: User avatars (public read, private write)
- `documents`: Consent forms, reports (private)

### 5. Edge Functions Setup
- Initialize Edge Functions directory structure
- Configure Deno runtime environment
- Set up CORS policies for web/mobile origins

### 6. Environment Variables
Configure the following secrets:
```
OPENAI_API_KEY=<key>
WHISPER_API_KEY=<key>
ABDM_GATEWAY_URL=<url>
ABDM_CLIENT_ID=<id>
ABDM_CLIENT_SECRET=<secret>
RAZORPAY_KEY_ID=<key>
RAZORPAY_KEY_SECRET=<secret>
WHATSAPP_API_TOKEN=<token>
```

### 7. Security Configuration
- Enable RLS on all tables by default
- Configure API rate limiting: 100 req/min per IP
- Set up SSL certificate for custom domain
- Enable audit logging for all database operations

## Acceptance Criteria
- [ ] Supabase project created in Mumbai region
- [ ] All required extensions enabled
- [ ] Authentication configured with email templates
- [ ] Storage buckets created with proper policies
- [ ] Edge Functions initialized
- [ ] All environment variables configured
- [ ] Security settings applied (RLS, rate limiting)
- [ ] Connection strings documented for web and mobile apps
- [ ] Backup policy configured (daily automated backups)

## Dependencies
None (foundational ticket)

## Estimated Effort
2-3 hours