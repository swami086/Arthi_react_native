'use server';

import { cookies } from 'next/headers';
import rollbar from '@/lib/rollbar';

export async function setOnboardingCompleted() {
    try {
        const cookieStore = await cookies();
        cookieStore.set('onboarding_completed', 'true', {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 365 * 24 * 60 * 60, // 1 year
            path: '/',
        });
        return { success: true };
    } catch (error) {
        rollbar.error('Failed to set onboarding cookie', { error });
        return { success: false, error: 'Could not complete onboarding' };
    }
}

export async function getOnboardingStatus() {
    try {
        const cookieStore = await cookies();
        const onboardingCookie = cookieStore.get('onboarding_completed');
        return onboardingCookie?.value === 'true';
    } catch (error) {
        rollbar.error('Failed to get onboarding status', { error });
        return false;
    }
}
