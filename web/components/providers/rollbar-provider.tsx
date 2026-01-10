'use client';

import React, { useEffect, useMemo } from 'react';
import { Provider } from '@rollbar/react';
import Rollbar from 'rollbar';
import { useAuth } from '@/components/providers/auth-provider';

interface RollbarProviderProps {
  children: React.ReactNode;
}

export function RollbarProvider({ children }: RollbarProviderProps) {
  const { user } = useAuth();

  // Create the rollbar instance only on the client
  const rollbar = useMemo(() => {
    if (typeof window === 'undefined') return null;

    return new Rollbar({
      accessToken: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
      environment: process.env.NEXT_PUBLIC_ROLLBAR_ENVIRONMENT || 'development',
      captureUncaught: true,
      captureUnhandledRejections: true,

      // ADD THESE:
      autoInstrument: true,
      maxTelemetryEvents: 50,
      scrubTelemetryInputs: true,
      includeItemsInTelemetry: true,

      checkIgnore: function (isUncaught, args, payload) {
        // 1. Check if args[0] is the error object or a message string
        const arg0 = args[0] as any;

        // Handle case where arg0 is the error object (manual calls)
        if (arg0 && typeof arg0 === 'object') {
          if (
            arg0.message === 'NEXT_REDIRECT' ||
            (typeof arg0.message === 'string' && arg0.message.includes('NEXT_REDIRECT')) ||
            (arg0.digest && typeof arg0.digest === 'string' && arg0.digest.startsWith('NEXT_REDIRECT'))
          ) {
            return true;
          }
        }

        // Handle case where arg0 is a string (uncaught exceptions often start with the message)
        if (typeof arg0 === 'string' && (arg0 === 'NEXT_REDIRECT' || arg0.includes('NEXT_REDIRECT'))) {
          return true;
        }

        // 2. Check regular window.onerror args (5th arg is the error object)
        if (isUncaught && args.length >= 5) {
          const errorObj = args[4] as any;
          if (errorObj && typeof errorObj === 'object') {
            if (
              errorObj.message === 'NEXT_REDIRECT' ||
              (typeof errorObj.message === 'string' && errorObj.message.includes('NEXT_REDIRECT')) ||
              (errorObj.digest && typeof errorObj.digest === 'string' && errorObj.digest.startsWith('NEXT_REDIRECT'))
            ) {
              return true;
            }
          }
        }

        // 3. Fallback: Check the constructed payload
        const payloadAny = payload as any;

        // Check message body
        const messageBody = payloadAny?.body?.message?.body;
        if (typeof messageBody === 'string' && (messageBody.includes('NEXT_REDIRECT') || messageBody === 'NEXT_REDIRECT')) {
          return true;
        }

        // Check exception message in trace
        const exceptionMessage = payloadAny?.body?.trace?.exception?.message;
        if (typeof exceptionMessage === 'string' && (exceptionMessage.includes('NEXT_REDIRECT') || exceptionMessage === 'NEXT_REDIRECT')) {
          return true;
        }

        return false;
      },
      payload: {
        person: { id: user?.id ?? null },
        client: {
          javascript: {
            source_map_enabled: true,
            code_version: process.env.NEXT_PUBLIC_ROLLBAR_CODE_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
            guess_uncaught_frames: true,
          },
        },
      },
    });
  }, [user?.id]);

  useEffect(() => {
    if (user && rollbar) {
      rollbar.configure({
        payload: {
          person: { id: user.id, email: user.email },
        },
      });
    }
  }, [user, rollbar]);

  // If no rollbar instance (e.g. on server), just render children
  if (!rollbar) {
    return <>{children}</>;
  }

  return <Provider instance={rollbar}>{children}</Provider>;
}

export default RollbarProvider;
