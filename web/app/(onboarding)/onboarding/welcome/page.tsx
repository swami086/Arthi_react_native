import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WelcomeClient from './_components/welcome-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Welcome | Onboarding | SafeSpace',
    description: 'Welcome to SafeSpace. Your journey to mental wellness begins here.',
};

export default async function WelcomePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data: prefs } = await supabase
            .from('user_agent_preferences')
            .select('onboarding_completed')
            .eq('user_id', user.id)
            .single();

        if (prefs?.onboarding_completed) {
            redirect('/home');
        }
    }

    return <WelcomeClient />;
}
