'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Chrome } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginSchema, LoginFormData } from '@/lib/validations';
import { signInWithEmail, signInWithGoogle } from '@/app/actions/auth';
import { addBreadcrumb, reportWarning, reportError, startTimer, endTimer } from '@/lib/rollbar-utils';

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        addBreadcrumb('Login form submitted', 'auth.login', 'info', { email: data.email });
        startTimer('login.submission');

        try {
            const result = await signInWithEmail(data);

            if (!result.success) {
                reportWarning('Login failed', 'auth.login', { error: result.error, email: data.email });
                toast.error(result.error);
                setError('root', { message: result.error });
                setIsLoading(false);
                return;
            }

            toast.success('Successfully logged in!');
            endTimer('login.submission', 'auth.login', { email: data.email });
            addBreadcrumb('Login successful, redirecting', 'auth.login', 'info');

            // Navigation is handled by server action redirect, 
            // but we keep loading till page changes
        } catch (error: any) {
            if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
                // We must rethrow to allow Next.js to handle the navigation
                throw error;
            }
            reportError(error, 'auth.login.submit');
            toast.error('An unexpected error occurred');
            setError('root', { message: 'An unexpected error occurred' });
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        addBreadcrumb('Google sign-in initiated', 'auth.login', 'info');

        try {
            const result = await signInWithGoogle();
            if (result && !result.success) {
                setError('root', { message: result.error });
                setIsGoogleLoading(false);
            }
        } catch (error) {
            reportError(error, 'auth.google.signIn');
            setError('root', { message: 'Google sign-in failed' });
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2 text-center lg:text-left">
                <h1 className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
                    Welcome Back
                </h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                    Enter your safe space to continue your journey.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errors.root && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3 bg-status-error/10 border border-status-error/20 rounded-xl text-status-error text-sm font-medium"
                    >
                        {errors.root.message}
                    </motion.div>
                )}

                <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    leftIcon={Mail}
                    error={errors.email?.message}
                    {...register('email')}
                />

                <div className="space-y-1">
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        leftIcon={Lock}
                        error={errors.password?.message}
                        {...register('password')}
                    />
                    <div className="flex justify-end">
                        <Link
                            href="/forgot-password"
                            className="text-sm font-medium text-primary hover:underline underline-offset-4"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12"
                    isLoading={isLoading}
                    leftIcon={<LogIn className="w-5 h-5" />}
                >
                    Log In
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border-light dark:border-border-dark" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background-light dark:bg-background-dark px-2 text-text-secondary-light dark:text-text-secondary-dark">
                        Or continue with
                    </span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-border-light dark:border-border-dark"
                onClick={handleGoogleSignIn}
                isLoading={isGoogleLoading}
                leftIcon={<Chrome className="w-5 h-5" />}
            >
                Sign in with Google
            </Button>

            <p className="px-8 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                Don't have an account?{' '}
                <Link
                    href="/signup"
                    className="font-semibold text-primary hover:underline underline-offset-4"
                >
                    Sign Up
                </Link>
            </p>
        </div>
    );
}
