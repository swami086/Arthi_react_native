import { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import ForgotPasswordForm from './_components/forgot-password-form';

export const metadata: Metadata = {
    title: 'Reset Password | SafeSpace',
    description: 'Reset your SafeSpace account password.',
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}
