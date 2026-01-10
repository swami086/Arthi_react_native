'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from '@rollbar/react';
import Rollbar from 'rollbar';
import { useUser } from '@/hooks/use-user';

const RollbarProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();

  const [rollbar] = useState(
    new Rollbar({
      accessToken: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
      environment: process.env.NEXT_PUBLIC_ROLLBAR_ENVIRONMENT || 'development',
      captureUncaught: true,
      captureUnhandledRejections: true,
      payload: {
        person: { id: user?.id },
        client: {
          javascript: {
            source_map_enabled: true,
            code_version: process.env.NEXT_PUBLIC_ROLLBAR_CODE_VERSION || '1.0.0',
            guess_uncaught_frames: true,
          },
        },
      },
    })
  );

  useEffect(() => {
    if (user) {
      rollbar.configure({
        payload: {
          person: { id: user.id, email: user.email },
        },
      });
    }
  }, [user, rollbar]);

  return <Provider instance={rollbar}>{children}</Provider>;
};

export default RollbarProvider;
