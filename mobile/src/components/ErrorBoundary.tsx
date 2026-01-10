import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ErrorBoundary as RollbarErrorBoundary } from 'rollbar-react-native';

const fallback = ({ error, resetError }: { error: Error, resetError: () => void }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Something went wrong.</Text>
    <Text style={styles.error}>{error.message}</Text>
    <TouchableOpacity
      onPress={resetError}
      style={{
        backgroundColor: '#30bae8',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
      }}
    >
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <RollbarErrorBoundary fallback={fallback}>{children}</RollbarErrorBoundary>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111827',
  },
  error: {
    marginBottom: 20,
    color: '#ef4444',
    textAlign: 'center',
  },
});
