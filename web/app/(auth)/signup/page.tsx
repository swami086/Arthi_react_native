import { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import SignUpForm from './_components/signup-form';

export const metadata: Metadata = {
    title: 'Create Account | SafeSpace',
    description: 'Join SafeSpace and start your journey to mental wellness.',
};

export default function SignUpPage() {
    return <SignUpForm />;
}
