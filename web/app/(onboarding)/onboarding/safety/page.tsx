import { Metadata } from 'next';
import SafetyClient from './_components/safety-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Safety | Onboarding | SafeSpace',
    description: 'Learn about our safety and privacy commitment.',
};

export default function SafetyPage() {
    return <SafetyClient />;
}
