# [Infrastructure] React Native Mobile App Setup with Expo

## Overview
Initialize the React Native mobile application using Expo SDK 52 with TypeScript, supporting both iOS and Android platforms.

## Context
Reference: `spec:df06a57d-bbce-4623-8e1c-cd129f15f2cf/40e954fc-4f47-4a50-89ff-6064819e3165` (Frontend Mobile Implementation)

The mobile app provides therapists with on-the-go access to patient management, session recording, and real-time insights.

## Technical Requirements

### 1. Project Initialization
```bash
npx create-expo-app@latest therapyflow-mobile --template expo-template-blank-typescript
```

### 2. Core Dependencies
```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "@supabase/supabase-js": "^2.45.4",
  "@react-native-async-storage/async-storage": "^2.0.0",
  "expo-secure-store": "~14.0.0",
  "expo-av": "~15.0.0",
  "expo-file-system": "~18.0.0",
  "react-native-health-connect": "^2.1.0",
  "expo-health-connect": "^1.0.0",
  "zustand": "^4.5.0",
  "@tanstack/react-query": "^5.59.0",
  "react-native-reanimated": "~3.16.0",
  "react-native-gesture-handler": "~2.20.0"
}
```

### 3. Project Structure
```
app/
├── (auth)/
│   ├── login.tsx
│   ├── signup.tsx
│   └── _layout.tsx
├── (tabs)/
│   ├── index.tsx (Dashboard)
│   ├── patients.tsx
│   ├── record.tsx
│   ├── insights.tsx
│   └── _layout.tsx
├── patient/
│   └── [id].tsx
└── _layout.tsx
components/
├── ui/
├── auth/
├── dashboard/
└── shared/
lib/
├── supabase/
├── storage/
├── audio/
└── health/
types/
constants/
```

### 4. Expo Configuration (app.json)
```json
{
  "expo": {
    "name": "TherapyFlow",
    "slug": "therapyflow-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.therapyflow.app",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "Record therapy sessions",
        "NSHealthShareUsageDescription": "Access health data for insights"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.therapyflow.app",
      "permissions": [
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "health.permission.READ_HEART_RATE",
        "health.permission.READ_SLEEP"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "expo-av"
    ]
  }
}
```

### 5. Supabase Client Setup
Configure Supabase client with AsyncStorage for session persistence.

### 6. Environment Configuration
Create `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_URL=
```

### 7. Navigation Setup
Configure Expo Router with authentication flow and tab navigation.

### 8. TypeScript Configuration
- Enable strict mode
- Configure path aliases
- Set up type definitions

## Acceptance Criteria
- [ ] Expo project initialized with TypeScript
- [ ] All dependencies installed
- [ ] Project structure created following spec
- [ ] Expo Router configured with auth flow
- [ ] Supabase client configured with AsyncStorage
- [ ] Environment variables set up
- [ ] iOS and Android permissions configured
- [ ] Development build runs on both platforms
- [ ] TypeScript strict mode enabled
- [ ] ESLint configured for React Native

## Dependencies
- Requires: Supabase Project Setup ticket completion

## Estimated Effort
4-5 hours