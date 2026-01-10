'use client';
import { useRollbar } from '@rollbar/react';
import { useEffect } from 'react';

type User = {
  id: string;
  email?: string;
  username?: string;
} | null;

export function RollbarUserUpdater({ user }: { user: User }) {
  const rollbar = useRollbar();

  useEffect(() => {
    rollbar.configure({
      payload: {
        person: user
      }
    });
  }, [user, rollbar]);

  return null;
}
