'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, LockKeyhole, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations';
import { resetPassword } from '@/app/actions/auth';
import { addBreadcrumb, reportWarning, reportError, startTimer, endTimer, reportInfo } from '@/lib/rollbar-utils';

export default function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        addBreadcrumb('Forgot password form submitted', 'auth.forgot', 'info', { email: data.email });
        startTimer('auth.forgotPassword');

        try {
            const result = await resetPassword(data.email);

            if (!result.success) {
                reportWarning('Forgot password failed', 'auth.forgot', { error: result.error, email: data.email });
                toast.error(result.error);
                setError('root', { message: result.error });
                setIsLoading(false);
                return;
            }

            endTimer('auth.forgotPassword', 'auth', { email: data.email });
            reportInfo('Password reset email requested', 'auth.forgot', { email: data.email });
            toast.success('Reset link sent to your email');
            setIsSuccess(true);
        } catch (error: any) {
            if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
                throw error;
            }
            reportError(error, 'auth.forgot.submit');
            setError('root', { message: 'An unexpected error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2 text-center lg:text-left">
                <div className="flex items-center gap-2 mb-2 group">
                    <Link
                        href="/login"
                        className="p-2 -ml-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark group-hover:text-primary" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
                        Reset Password
                    </h1>
                </div>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                    {isSuccess
                        ? "We've sent a recovery link to your email."
                        : "Enter your email address to receive a password reset link."}
                </p>
            </div>

            <AnimatePresence mode="wait">
                {!isSuccess ? (
                    <motion.form
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <div className="flex justify-center py-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                                <LockKeyhole className="w-10 h-10 text-primary" />
                            </div>
                        </div>

                        {errors.root && (
                            <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-xl text-status-error text-sm font-medium">
                                {errors.root.message}
                            </div>
                        )}

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@example.com"
                            leftIcon={Mail}
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <Button
                            type="submit"
                            className="w-full h-12"
                            isLoading={isLoading}
                            leftIcon={<Send className="w-4 h-4" />}
                        >
                            Send Reset Link
                        </Button>
                    </motion.form>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-10 space-y-6 text-center"
                    >
                        <div className="w-20 h-20 bg-status-success/10 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-status-success" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Check Your Email</h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-xs mx-auto">
                                We've sent password reset instructions to your email address. Please check your inbox and spam folder.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full h-12 border-border-light dark:border-border-dark"
                            onClick={() => setIsSuccess(false)}
                        >
                            Didn't receive it? Try again
                        </Button>
                        <Link
                            href="/login"
                            className="text-sm font-semibold text-primary hover:underline underline-offset-4"
                        >
                            Back to Login
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
