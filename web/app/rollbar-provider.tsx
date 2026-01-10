'use client';
import { Provider, ErrorBoundary } from '@rollbar/react';
import rollbar from '@/lib/rollbar';
import { RollbarUserProvider } from './rollbar-user-provider';

export function RollbarProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider instance={rollbar}>
      <ErrorBoundary>
        <RollbarUserProvider>
          {children}
        </RollbarUserProvider>
      </ErrorBoundary>
    </Provider>
  );
}
