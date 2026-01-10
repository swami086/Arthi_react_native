import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import './src/global.css'; // Import global css for NativeWind
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { AuthProvider } from './src/features/auth/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from './src/hooks/useColorScheme';
import { navigationRef, onNavigationStateChange, onUnhandledAction } from './src/navigation/navigationErrorHandler';
import { linking } from './src/navigation/linking';
import RollbarProvider from './src/components/RollbarProvider';
import { registerRollbarLifecycle } from './src/services/rollbar';

import { View } from 'react-native';

export default function App() {
  const { colorScheme, isLoaded, isDark } = useColorScheme();

  useEffect(() => {
    return registerRollbarLifecycle();
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <RollbarProvider>
        <ErrorBoundary>
          <AuthProvider>
            <View className={`flex-1 ${isDark ? 'dark' : ''}`}>
              <NavigationContainer
                theme={isDark ? DarkTheme : DefaultTheme}
                ref={navigationRef}
                linking={linking}
                onStateChange={onNavigationStateChange}
                onUnhandledAction={onUnhandledAction}
              >
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <AppNavigator />
              </NavigationContainer>
            </View>
          </AuthProvider>
        </ErrorBoundary>
      </RollbarProvider>
    </SafeAreaProvider>
  );
}
