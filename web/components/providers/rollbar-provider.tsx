'use client';
import { Provider, ErrorBoundary } from '@rollbar/react';
import rollbar from '@/lib/rollbar';
import { useAuth } from '@/components/providers/auth-provider';
import { useEffect } from 'react';

export function RollbarProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      rollbar.configure({
        payload: {
          person: {
            id: user.id,
            email: user.email,
          },
        },
      });
    }
  }, [user]);

  return (
    <Provider instance={rollbar}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </Provider>
  );
}
