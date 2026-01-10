import { Metadata } from 'next';
import FeaturesClient from './_components/features-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Features | Onboarding | SafeSpace',
    description: 'Learn about the features available on SafeSpace.',
};

export default function FeaturesPage() {
    return <FeaturesClient />;
}
