# TherapyFlow AI

An AI-powered therapy platform that transforms mental health care through multi-agent AI assistance, enabling therapists to serve 3x more patients while providing 24/7 intelligent support.

## Overview

TherapyFlow AI is a comprehensive mental health platform built with React Native (mobile) and Next.js (web). It leverages cutting-edge AI technology including Claude Sonnet 4.5, GPT-5.2, and LangGraph.js to automate routine tasks, provide real-time clinical assistance, and enable proactive patient engagement.

### Key Features

- **Multi-Agent AI System**: Specialized agents for booking, sessions, insights, and follow-ups
- **Real-Time AI Copilot**: Assists therapists during live sessions with clinical decision support
- **24/7 Patient Support**: Conversational AI chat available around the clock
- **Proactive Wellness Checks**: Automated check-ins and mood tracking
- **HIPAA Compliant**: PII masking, encryption, and comprehensive audit logs
- **Offline-First Mobile**: Works without internet and syncs when connected
- **Multi-Language Support**: English, Hindi, and Hinglish voice input

## Project Structure

```
Arthi_react_native/
├── mobile/              # React Native Expo mobile app
├── web/                 # Next.js 15 web application
├── docs/                # Documentation
├── scripts/             # Utility scripts
└── supabase/            # Database migrations and edge functions
```

## Tech Stack

### Mobile (React Native)
- Expo SDK 54
- React Native 0.81
- NativeWind (Tailwind CSS)
- Supabase for backend
- Daily.co for video calls

### Web (Next.js)
- Next.js 15
- React 18
- Tailwind CSS 4
- Supabase SSR
- LangChain for AI orchestration
- Recharts for data visualization

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (for mobile development)
- iOS Simulator / Android Emulator (for mobile testing)

### Mobile App Setup

```bash
cd mobile
npm install
npm start
```

For iOS:
```bash
npm run ios
```

For Android:
```bash
npm run android
```

### Web App Setup

```bash
cd web
npm install
npm run dev
```

The web app will be available at `http://localhost:3000`.

## Environment Variables

Create `.env` files in both `mobile/` and `web/` directories. See `.env.example` files for required variables.

### Required Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `OPENAI_API_KEY`: OpenAI API key for AI features

## Development

### Running Tests

Web:
```bash
cd web
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
```

### Linting

```bash
cd web
npm run lint
```

### Building for Production

Web:
```bash
cd web
npm run build
```

Mobile:
```bash
cd mobile
npm run build:ios
npm run build:android
```

## Architecture

The platform uses a multi-agent AI architecture:

- **LangGraph Orchestrator**: Routes requests to specialized agents
- **BookingAgent**: Handles appointment scheduling
- **SessionAgent**: Provides real-time therapist assistance
- **InsightsAgent**: Analyzes patient progress
- **FollowupAgent**: Manages proactive wellness checks

All agents access a RAG (Retrieval-Augmented Generation) system backed by pgvector for context-aware responses.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow existing code conventions
- Use TypeScript for type safety
- Write tests for new features
- Ensure all tests pass before submitting PR

## License

This project is proprietary software. All rights reserved.

## Support

For questions or support, please open an issue in this repository.
