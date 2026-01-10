# SEO & Performance Implementation Guide

## Overview
This document outlines the SEO and performance strategies implemented for the SafeSpace web application.

## 1. Metadata Strategy
A centralized metadata utility (`lib/metadata.ts`) ensures consistent tags across the application.

- **Title Template**: `%s | SafeSpace`
- **Canonical URLs**: Automatically generated based on `NEXT_PUBLIC_SITE_URL`.
- **Open Graph**: Custom OG images generated dynamically via `/api/og?title=...`.
- **Robots**: Admin and private routes are set to `noindex`.

### Page-Specific Metadata
- **Landing Page**: Optimized title/description.
- **Mentors List**: Dynamic title showing available mentor count.
- **Mentor Profile**: Dynamic title/description/image based on mentor data.
- **Booking**: Includes mentor name in title.
- **Login/Auth**: "Welcome Back" / "Join SafeSpace".

## 2. Structured Data (JSON-LD)
Schema.org structured data is injected using utilities in `lib/schemas.ts`.

- **Organization**: Injected in `RootLayout`. Includes logo, social links, contact info.
- **Person (Mentor)**: Injected in Mentor Profile. Includes `aggregateRating` and `encircles` expertise.
- **Service**: Injected in Booking pages to describe the 1-on-1 session.
- **ItemList**: Injected in Main Mentors List for rich results.

## 3. Crawling & Indexing
- **sitemap.ts**: Python-managed dynamic sitemap including all public mentor profiles (updated weekly).
- **robots.ts**: Disallows `/admin/`, `/api/`, and dashboard routes.

## 4. Performance Optimizations

### Caching Strategy (ISR)
- **Mentors List**: Cached for 5 minutes (`revalidate = 300`).
- **Mentor Profiles**: Cached for 5 minutes (`revalidate = 300`).
- **Static Generation**: `generateStaticParams` is implemented for `[id]` pages to pre-render mentor profiles at build time.

### Virtualization & Code Splitting
- **Mentors List**: Implemented `useWindowVirtualizer` from `@tanstack/react-virtual` to handle large lists efficiently.
  - Reduces DOM nodes and improves main thread responsiveness.
  - Adaptive column count based on viewport (`hooks/use-media-query.ts`).
- **Landing Page**: Interactive elements (Hero, Features) extracted to Client Components to allow the main page to be a Server Component (better TTFB).

### Resource Hints
- Preconnect links for Supabase and Razorpay added to `RootLayout`.

## 5. Audit Procedures
To verify SEO and Performance:

1. **Lighthouse**:
   - Run a Lighthouse audit in Chrome DevTools (Incognito).
   - Target Scores: SEO 100, Performance > 90.

2. **Schema Validator**:
   - Use [Schema Markup Validator](https://validator.schema.org/) on the deployed URL or HTML snippet.
   - Verify `Organization`, `Person`, and `Service` types.

3. **Core Web Vitals**:
   - Monitor LCP (Largest Contentful Paint) - Virtualization helps here.
   - Monitor CLS (Cumulative Layout Shift) - Ensure images have dimensions.

## 6. Maintenance
- When adding new pages, always export `metadata` using `generateSeoMetadata`.
- Update `sitemap.ts` if new dynamic routes are added.
