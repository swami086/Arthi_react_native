
import { createClient } from '@/lib/supabase/server';
import { RollbarUserUpdater } from './rollbar-user-updater';

export async function RollbarUserProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  let user = null;
  if (!error && data.user) {
    user = {
      id: data.user.id,
      email: data.user.email,
      username: data.user.email,
    };
  }

  return (
    <>
      <RollbarUserUpdater user={user} />
      {children}
    </>
  );
}
