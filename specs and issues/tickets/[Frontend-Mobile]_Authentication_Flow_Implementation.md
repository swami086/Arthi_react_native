# [Frontend-Mobile] Authentication Flow Implementation

## Overview
Implement the complete authentication flow for the React Native mobile app including login, signup, biometric authentication, and secure token storage.

## Context
Reference: `spec:df06a57d-bbce-4623-8e1c-cd129f15f2cf/40e954fc-4f47-4a50-89ff-6064819e3165` (Frontend Mobile Implementation - Authentication Section)

Mobile authentication must be seamless and secure, supporting biometric authentication (Face ID/Fingerprint) for quick access.

## Authentication Screens

### 1. Welcome Screen
```wireframe
┌─────────────────────────┐
│                         │
│      TherapyFlow        │
│         Logo            │
│                         │
│   AI-Powered Practice   │
│   Management for        │
│   Mental Health         │
│   Professionals         │
│                         │
│                         │
│  ┌───────────────────┐  │
│  │   Get Started     │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │   Sign In         │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

### 2. Login Screen
```wireframe
┌─────────────────────────┐
│  ← Back                 │
│                         │
│  Welcome Back           │
│  Sign in to continue    │
│                         │
│  ┌───────────────────┐  │
│  │ Email             │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Password     [👁] │  │
│  └───────────────────┘  │
│                         │
│  Forgot password?       │
│                         │
│  ┌───────────────────┐  │
│  │   Sign In         │  │
│  └───────────────────┘  │
│                         │
│  ─────── OR ───────     │
│                         │
│  ┌───────────────────┐  │
│  │ 👆 Use Face ID    │  │
│  └───────────────────┘  │
│                         │
│  Don't have account?    │
│  Sign up                │
└─────────────────────────┘
```

### 3. Signup Screen
```wireframe
┌─────────────────────────┐
│  ← Back                 │
│                         │
│  Create Account         │
│  Join TherapyFlow       │
│                         │
│  ┌───────────────────┐  │
│  │ Full Name         │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Email             │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Password     [👁] │  │
│  └───────────────────┘  │
│                         │
│  ☐ I agree to Terms    │
│                         │
│  ┌───────────────────┐  │
│  │   Create Account  │  │
│  └───────────────────┘  │
│                         │
│  Already have account?  │
│  Sign in                │
└─────────────────────────┘
```

## Technical Requirements

### 1. Expo Router Setup
```typescript
// app/_layout.tsx
import { useAuth } from '@/lib/hooks/useAuth';
import { Redirect, Slot } from 'expo-router';

export default function RootLayout() {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!session) {
    return <Redirect href="/auth/welcome" />;
  }
  
  return <Slot />;
}
```

### 2. Auth Context Provider
```typescript
// lib/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  };
  
  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
  };
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };
  
  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 3. Supabase Client with Secure Storage
```typescript
// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

### 4. Login Screen Component
```typescript
// app/auth/login.tsx
import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useBiometrics } from '@/lib/hooks/useBiometrics';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { authenticate, isAvailable } = useBiometrics();
  
  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleBiometricLogin = async () => {
    const success = await authenticate();
    if (success) {
      // Retrieve stored credentials and sign in
      const credentials = await getStoredCredentials();
      await signIn(credentials.email, credentials.password);
      router.replace('/(tabs)');
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Text>
      </TouchableOpacity>
      
      {isAvailable && (
        <TouchableOpacity 
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
        >
          <Text>👆 Use Face ID</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

### 5. Biometric Authentication Hook
```typescript
// lib/hooks/useBiometrics.ts
import * as LocalAuthentication from 'expo-local-authentication';
import { useState, useEffect } from 'react';

export function useBiometrics() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  
  useEffect(() => {
    checkBiometricAvailability();
  }, []);
  
  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    setIsAvailable(compatible && enrolled);
    
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      setBiometricType('Face ID');
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      setBiometricType('Fingerprint');
    }
  };
  
  const authenticate = async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access TherapyFlow',
      fallbackLabel: 'Use passcode',
    });
    
    return result.success;
  };
  
  return { isAvailable, biometricType, authenticate };
}
```

### 6. Secure Credential Storage
```typescript
// lib/utils/credentials.ts
import * as SecureStore from 'expo-secure-store';

export async function storeCredentials(email: string, password: string) {
  await SecureStore.setItemAsync('user_email', email);
  await SecureStore.setItemAsync('user_password', password);
}

export async function getStoredCredentials() {
  const email = await SecureStore.getItemAsync('user_email');
  const password = await SecureStore.getItemAsync('user_password');
  return { email, password };
}

export async function clearStoredCredentials() {
  await SecureStore.deleteItemAsync('user_email');
  await SecureStore.deleteItemAsync('user_password');
}
```

## Acceptance Criteria
- [ ] Welcome screen implemented
- [ ] Login screen implemented with validation
- [ ] Signup screen implemented with validation
- [ ] Password reset flow working
- [ ] Biometric authentication working (Face ID/Fingerprint)
- [ ] Secure token storage with expo-secure-store
- [ ] Auth state persistence across app restarts
- [ ] Auto-refresh token working
- [ ] Error handling for all auth scenarios
- [ ] Loading states implemented
- [ ] Deep linking for email verification working
- [ ] Logout functionality working
- [ ] Session expiry handling
- [ ] Responsive design on different screen sizes

## Dependencies
- Requires: React Native Mobile App Setup
- Requires: Authentication System Implementation

## Estimated Effort
8-10 hours