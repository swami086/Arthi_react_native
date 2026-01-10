import { Metadata } from 'next';
import WelcomeClient from './_components/welcome-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Welcome | Onboarding | SafeSpace',
    description: 'Welcome to SafeSpace. Your journey to mental wellness begins here.',
};

export default function WelcomePage() {
    return <WelcomeClient />;
}
