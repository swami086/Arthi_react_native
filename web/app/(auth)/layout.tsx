'use client';



import React from 'react';
import { motion } from 'framer-motion';
import { HandHeart } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background-light dark:bg-background-dark">
            {/* Left Side: Branding (Visible on LG up) */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-primary p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />

                {/* Abstract background shapes */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-24 -left-24 w-96 h-96 border-4 border-white/10 rounded-full"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-12 -right-12 w-64 h-64 border-4 border-white/10 rounded-full"
                />

                <div className="relative z-10 flex flex-col items-center text-center max-w-md">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                        className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-xl mb-8"
                    >
                        <HandHeart className="w-12 h-12 text-white" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl font-bold text-white mb-4 tracking-tight"
                    >
                        SafeSpace
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/80 text-xl font-medium leading-relaxed"
                    >
                        Your journey to mental wellness begins in a space built for your safety and growth.
                    </motion.p>
                </div>
            </div>

            {/* Right Side: Auth Forms */}
            <div className="flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md">
                    <div className="flex justify-center lg:hidden mb-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <HandHeart className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-primary">SafeSpace</span>
                        </Link>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {children}
                    </motion.div>

                    <div className="mt-12 pt-8 border-t border-border-light dark:border-border-dark flex flex-wrap justify-center gap-6 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="/support" className="hover:text-primary transition-colors">Support</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
