import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'Terms of Service | SafeSpace',
    description: 'Read our Terms of Service to understand how to use SafeSpace securely and responsibly.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300 pb-20">
            {/* Header / Navigation */}
            <header className="sticky top-0 z-50 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/signup" className="group flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Sign Up</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-text-primary-light dark:text-text-primary-dark">SafeSpace</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-12">
                {/* Hero Section */}
                <div className="text-center space-y-4 mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                        <Scale className="w-4 h-4" />
                        Legal Agreement
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-text-primary-light dark:text-text-primary-dark">
                        Terms of Service
                    </h1>
                    <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto">
                        Last updated: January 10, 2026. Please read these terms carefully before using our platform.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar / Quick Links */}
                    <aside className="md:col-span-1 border-r border-border-light dark:border-border-dark pr-8 hidden md:block">
                        <nav className="sticky top-32 space-y-4">
                            <h3 className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest px-2">On this page</h3>
                            {[
                                { id: 'acceptance', label: 'Acceptance' },
                                { id: 'services', label: 'Our Services' },
                                { id: 'accounts', label: 'User Accounts' },
                                { id: 'conduct', label: 'User Conduct' },
                                { id: 'privacy', label: 'Privacy Policy' },
                                { id: 'liability', label: 'Liability' },
                            ].map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    className="block px-3 py-2 rounded-xl text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/5 hover:text-primary transition-all underline-offset-4"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Text */}
                    <div className="md:col-span-2 space-y-12 pb-20">
                        <section id="acceptance" className="scroll-mt-32 space-y-4">
                            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-3">
                                <CheckCircleIcon /> 1. Acceptance of Terms
                            </h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                By accessing or using SafeSpace, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                            </p>
                        </section>

                        <section id="services" className="scroll-mt-32 space-y-4">
                            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-3">
                                <BoxIcon /> 2. Description of Services
                            </h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                SafeSpace provides an AI-powered platform for therapeutic session recording, transcription, and SOAP note generation. Our services are intended to assist healthcare professionals but do not replace professional judgment or clinical diagnosis.
                            </p>
                        </section>

                        <section id="accounts" className="scroll-mt-32 space-y-4">
                            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-3">
                                <UserIcon /> 3. User Accounts
                            </h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
                            </p>
                            <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/20 flex gap-4">
                                <Lock className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                                <p className="text-sm text-secondary font-medium italic">
                                    Pro-tip: Multi-factor authentication is highly recommended for all healthcare practitioners to ensure HIPAA compliance.
                                </p>
                            </div>
                        </section>

                        <section id="conduct" className="scroll-mt-32 space-y-4">
                            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-3">
                                <FileText className="w-6 h-6 text-primary" /> 4. User Conduct
                            </h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                Users must comply with all ethical and professional standards appropriate to their jurisdiction. Recording sessions without explicit patient consent is strictly prohibited and may result in immediate account termination.
                            </p>
                        </section>

                        <section id="privacy" className="scroll-mt-32 space-y-4">
                            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-3">
                                <Eye className="w-6 h-6 text-primary" /> 5. Privacy & Data Handling
                            </h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                Your privacy is paramount. All recordings and transcripts are encrypted at rest and in transit. We do not use user data to train our AI models for other users without explicit, de-identified consent.
                            </p>
                        </section>

                        <section id="liability" className="scroll-mt-32 space-y-4">
                            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-3">
                                <Shield className="w-6 h-6 text-primary" /> 6. Limitation of Liability
                            </h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                SafeSpace shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                            </p>
                        </section>

                        <div className="pt-12 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                Questions? Contact us at <a href="mailto:legal@safespace.com" className="text-primary font-bold hover:underline">legal@safespace.com</a>
                            </div>
                            <Button asChild className="rounded-2xl">
                                <Link href="/signup">Accept and Return</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function CheckCircleIcon() {
    return <CheckCircle2Icon className="w-6 h-6 text-primary" />;
}

function CheckCircle2Icon({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>;
}

function BoxIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>;
}

function UserIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
