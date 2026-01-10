export const dynamic = 'force-dynamic';

import { generateMetadata } from '@/lib/metadata';
import LoginForm from './_components/login-form';

export const metadata = generateMetadata({
    title: 'Login - SafeSpace',
    description: 'Log in to your SafeSpace account to connect with mentors and access mental health resources.',
    path: '/login',
});

export default function LoginPage() {
    return <LoginForm />;
}
