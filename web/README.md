# SafeSpace Web (Next.js 15)

## AI Agents Architecture
Standardized on **GPT-4o**, our AI system provides seamless therapeutic support via:
- **Booking Assistant**: Real-time scheduling and therapist matching.
- **Session Copilot**: Clinical assistance during therapy sessions.
- **Insights Agent**: Behavioral pattern identification and progress tracking.
- **Wellness Companion**: Post-session engagement and mood monitoring.

### Documentation
- [AI Agents Overview](./docs/AI_AGENTS.md)
- [RAG System Configuration](./docs/RAG_SYSTEM.md)
- [A2UI Implementation Guide](./docs/A2UI_GUIDE.md)
- [Deployment Checklist](./docs/DEPLOYMENT.md)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testing

This project uses **Vitest** for unit/integration testing and **Playwright** for end-to-end testing.

### Run Unit & Integration Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npx playwright install # One time setup
npm run test:e2e
```

### Coverage Report
```bash
npm run test:coverage
```

### A2UI Infrastructure
A2UI (Agent-to-User Interface) components and logic have their own testing suite located in `lib/a2ui/__tests__`.
