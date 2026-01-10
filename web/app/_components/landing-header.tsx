'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function LandingHeader() {
    const router = useRouter();
    const { user, profile } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const getHomeLink = () => {
        if (!user) return '/signup';
        if (profile?.role === 'therapist') return '/therapist/home';
        if (profile?.role === 'admin') return '/admin/dashboard';
        return '/home';
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push('/')}>
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                                SafeSpace
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/about" className="text-sm font-semibold hover:text-primary transition-colors">How it works</Link>
                            <Link href="/therapists" className="text-sm font-semibold hover:text-primary transition-colors">Our Therapists</Link>
                            <Link href="/pricing" className="text-sm font-semibold hover:text-primary transition-colors">Pricing</Link>
                            {user ? (
                                <Button size="sm" className="rounded-full px-6" onClick={() => router.push(getHomeLink())}>Go to Dashboard</Button>
                            ) : (
                                <>
                                    <Button variant="ghost" className="text-sm font-bold" onClick={() => router.push('/login')}>Log In</Button>
                                    <Button size="sm" className="rounded-full px-6" onClick={() => router.push('/signup')}>Join SafeSpace</Button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden fixed inset-0 z-40 bg-background-light dark:bg-background-dark pt-20 px-6"
                >
                    <div className="flex flex-col gap-6">
                        <Link href="/about" className="text-2xl font-bold text-center py-4 border-b border-gray-100 dark:border-gray-800">How it works</Link>
                        <Link href="/therapists" className="text-2xl font-bold text-center py-4 border-b border-gray-100 dark:border-gray-800">Our Therapists</Link>
                        <Link href="/pricing" className="text-2xl font-bold text-center py-4 border-b border-gray-100 dark:border-gray-800">Pricing</Link>
                        <div className="flex flex-col gap-4 pt-8">
                            {user ? (
                                <Button className="w-full h-14 text-lg" onClick={() => router.push(getHomeLink())}>Go to Dashboard</Button>
                            ) : (
                                <>
                                    <Button className="w-full h-14 text-lg" onClick={() => router.push('/signup')}>Get Started Free</Button>
                                    <Button variant="outline" className="w-full h-14 text-lg" onClick={() => router.push('/login')}>Log In</Button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </>
    );
}
