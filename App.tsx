import React from 'react';
import './src/global.css'; // Import global css for NativeWind
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/features/auth/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from './src/hooks/useColorScheme';

export default function App() {
  const { colorScheme, isLoaded } = useColorScheme();

  if (!isLoaded) {
    return null; // Or a splash screen
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <AppNavigator />
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
