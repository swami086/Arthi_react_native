'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
    Mail,
    Lock,
    User,
    UserCheck,
    GraduationCap,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    Info
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signupSchema, SignUpFormData } from '@/lib/validations';
import { signUpWithEmail } from '@/app/actions/auth';
import { addBreadcrumb, reportWarning, reportError, startTimer, endTimer, reportInfo } from '@/lib/rollbar-utils';
import { cn } from '@/lib/utils';

export default function SignUpForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        setError,
        formState: { errors },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            role: 'patient',
            termsAccepted: false,
        }
    });

    const selectedRole = watch('role');
    const termsAccepted = watch('termsAccepted');

    const onSubmit = async (data: SignUpFormData) => {
        setIsLoading(true);
        addBreadcrumb('Sign up form submitted', 'auth.signup', 'info', { email: data.email, role: data.role });
        startTimer('signup.submission');

        try {
            const result = await signUpWithEmail(data.email, data.password, {
                fullName: data.fullName,
                role: data.role
            });

            if (!result.success) {
                reportWarning('Sign up failed', 'auth.signup', { error: result.error, email: data.email, role: data.role });
                toast.error(result.error);
                setError('root', { message: result.error });
                setIsLoading(false);
                return;
            }

            toast.success('Account created successfully!');
            endTimer('signup.submission', 'auth.signup', { email: data.email });
            reportInfo('New user signed up', 'auth.signup', { email: data.email, role: data.role });

            // Navigation is handled by server action redirect
        } catch (error: any) {
            // Next.js redirection works by throwing an error
            if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
                endTimer('signup.submission', 'auth.signup', { email: data.email, outcome: 'redirect' });
                // We must rethrow to allow Next.js to handle the navigation
                throw error;
            }

            reportError(error, 'auth.signup.submit');
            toast.error('An unexpected error occurred');
            setError('root', { message: 'An unexpected error occurred' });
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2 text-center lg:text-left">
                <h1 className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
                    Create Account
                </h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                    Join SafeSpace and start your journey today.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    label="Full Name"
                    type="text"
                    placeholder="John Doe"
                    leftIcon={User}
                    error={errors.fullName?.message}
                    {...register('fullName')}
                />

                <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    leftIcon={Mail}
                    error={errors.email?.message}
                    {...register('email')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        leftIcon={Lock}
                        error={errors.password?.message}
                        {...register('password')}
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        leftIcon={ShieldCheck}
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                    />
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark ml-1">
                        I am a...
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setValue('role', 'patient')}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200",
                                selectedRole === 'patient'
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                    : "border-border-light dark:border-border-dark hover:border-primary/50"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors",
                                selectedRole === 'patient' ? "bg-primary text-white" : "bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark"
                            )}>
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className={cn(
                                "font-semibold text-sm",
                                selectedRole === 'patient' ? "text-primary" : "text-text-secondary-light dark:text-text-secondary-dark"
                            )}>Patient</span>
                            {selectedRole === 'patient' && (
                                <div className="absolute top-2 right-2 text-primary">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setValue('role', 'therapist')}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200",
                                selectedRole === 'therapist'
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                    : "border-border-light dark:border-border-dark hover:border-primary/50"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors",
                                selectedRole === 'therapist' ? "bg-primary text-white" : "bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark"
                            )}>
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <span className={cn(
                                "font-semibold text-sm",
                                selectedRole === 'therapist' ? "text-primary" : "text-text-secondary-light dark:text-text-secondary-dark"
                            )}>Therapist</span>
                            {selectedRole === 'therapist' && (
                                <div className="absolute top-2 right-2 text-primary">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            )}
                        </button>
                    </div>
                    {errors.role && <p className="text-xs text-status-error ml-1">{errors.role.message}</p>}
                </div>

                {selectedRole === 'therapist' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 p-3 bg-secondary/10 border border-secondary/20 rounded-xl"
                    >
                        <Info className="w-5 h-5 text-secondary flex-shrink-0" />
                        <p className="text-xs text-secondary font-medium leading-relaxed">
                            Note: Therapist accounts require admin approval before you can access the platform.
                        </p>
                    </motion.div>
                )}

                <div className="flex items-center space-x-2 px-1">
                    <input
                        type="checkbox"
                        id="terms"
                        className="h-4 w-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary"
                        {...register('termsAccepted')}
                    />
                    <label htmlFor="terms" className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        I agree to the{' '}
                        <Link href="/terms" className="text-primary hover:underline font-medium">Terms and Conditions</Link>
                    </label>
                </div>
                {errors.termsAccepted && <p className="text-xs text-status-error ml-1">{errors.termsAccepted.message}</p>}

                <Button
                    type="submit"
                    className="w-full h-12"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                    Create Account
                </Button>
            </form>

            <p className="px-8 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="font-semibold text-primary hover:underline underline-offset-4"
                >
                    Log In
                </Link>
            </p>
        </div>
    );
}
