'use client';

import React, { useEffect, useMemo } from 'react';
import { Provider } from '@rollbar/react';
import { rollbar } from '@/lib/rollbar';
import { useAuth } from '@/components/providers/auth-provider';

interface RollbarProviderProps {
  children: React.ReactNode;
}

export function RollbarProvider({ children }: RollbarProviderProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      rollbar.configure({
        payload: {
          person: { id: user.id, email: user.email },
        },
      });
    }
  }, [user]);

  return <Provider instance={rollbar}>{children}</Provider>;
}

export default RollbarProvider;
