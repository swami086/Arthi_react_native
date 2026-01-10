'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Menu,
    ShieldCheck,
    Flower2,
    Slash,
    MessageCircle,
    Shirt,
    Users2,
    Rocket,
    ArrowRight,
    Star,
    Info,
    X,
    Phone
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LandingPageVariant2() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-[#f8fbfc] dark:bg-[#111d21] font-sans text-[#0e181b] dark:text-white transition-colors duration-200">

            {/* Top App Bar */}
            <div className="sticky top-0 z-40 flex items-center bg-[#f8fbfc]/90 dark:bg-[#111d21]/90 backdrop-blur-md p-4 justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#30bae8]/20 text-[#30bae8]">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Safe Space</h2>
                </div>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <div className="flex flex-col w-full max-w-md mx-auto overflow-x-hidden pb-24">

                {/* Hero Section */}
                <div className="px-4 pt-6 pb-2">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="tracking-tight text-[32px] font-extrabold leading-[1.15] text-left"
                    >
                        Therapisting for the <span className="text-[#30bae8]">real you.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 dark:text-gray-300 text-lg font-normal leading-relaxed pt-3 pb-4"
                    >
                        A low-pressure space to grow confidence, build resilience, and find your voice. No clinical labels, just human guidance.
                    </motion.p>

                    <div className="flex gap-2 flex-wrap mb-6">
                        <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#e7f0f3] dark:bg-gray-800 pl-3 pr-4 border border-transparent dark:border-gray-700">
                            <ShieldCheck className="w-4 h-4 text-[#30bae8]" />
                            <p className="text-sm font-semibold">Therapisting</p>
                        </div>
                        <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#e7f0f3] dark:bg-gray-800 pl-3 pr-4 border border-transparent dark:border-gray-700">
                            <Flower2 className="w-4 h-4 text-[#30bae8]" />
                            <p className="text-sm font-semibold">Growth</p>
                        </div>
                        <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#e7f0f3] dark:bg-gray-800 pl-3 pr-4 border border-transparent dark:border-gray-700">
                            <Slash className="w-4 h-4 text-[#30bae8]" />
                            <p className="text-sm font-semibold">Not Therapy</p>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-full relative overflow-hidden rounded-[2rem] aspect-[4/3] shadow-sm group"
                    >
                        <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5NswgvnQBfEQBSsCNTWXK74n6ysVP6ago1FPTuZvO4RfuQfCmXNVSd-bI0IPNdDJrpaPNBb5FRMEIPZfwOqmGj2NEjpE-adilwDSBF6L64TAroG0oJCE1o8A9Ze_BE2HRs5sbj_KaY9pzdJYkzlqSzhGGdmB1lX79M1_xk1k5Hd6K0sobMIWGz_bwnodOT_NHo5_RWCF53sFbOXTyYwaEi4Lum1HcSBxgBLYophcUc3HnzdVwCFJVy0-n3b01eiKvh2rQvTg_fFfe"
                            alt="Community"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </motion.div>
                </div>

                {/* Action Button */}
                <div className="px-4 py-6">
                    <Button
                        className="w-full h-14 bg-[#30bae8] hover:bg-[#30bae8]/90 text-white rounded-full font-bold text-lg shadow-lg shadow-[#30bae8]/30"
                        leftIcon={<MessageCircle className="w-5 h-5" />}
                        onClick={() => router.push('/signup')}
                    >
                        Start a Conversation
                    </Button>
                    <p className="text-center text-xs text-gray-400 mt-3 dark:text-gray-500">Free 15-min intro • Therapistship & Coaching</p>
                </div>

                {/* Areas of Focus section */}
                <div className="py-6 w-full">
                    <div className="px-4 mb-4 flex justify-between items-end">
                        <h3 className="text-xl font-bold">Areas of Focus</h3>
                        <span className="text-sm text-[#30bae8] font-medium">Swipe →</span>
                    </div>

                    <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory no-scrollbar">
                        {/* Focus Card 1 */}
                        <div className="snap-center shrink-0 w-[260px] bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                                <Shirt className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-lg">Presence & Style</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                Build confidence in how you present yourself. Get coaching on public speaking, dressing, and personal presence.
                            </p>
                        </div>

                        {/* Focus Card 2 */}
                        <div className="snap-center shrink-0 w-[260px] bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500">
                                <Users2 className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-lg">Social Dynamics</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                Navigate the awkward stuff. Get age-appropriate guidance on dating, reading social cues, and friendships.
                            </p>
                        </div>

                        {/* Focus Card 3 */}
                        <div className="snap-center shrink-0 w-[260px] bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-500">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-lg">Mindfulness</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                Non-clinical mindfulness practices to build emotional resilience and reduce stress without medical jargon.
                            </p>
                        </div>

                        {/* Focus Card 4 */}
                        <div className="snap-center shrink-0 w-[260px] bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-lg">Future Ready</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                Tackle early career anxiety and school pressure. We help you map out your next steps with clarity.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Promo Banner */}
                <div className="px-4 py-6">
                    <div className="bg-[#e7f0f3] dark:bg-gray-800/50 rounded-[2rem] p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[#30bae8]/20 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-3">From School to College</h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium leading-relaxed font-body">
                                Whether you are a student facing exams or a young adult starting a career, we offer proactive support. We focus on personal development and reflective conversation to help you thrive.
                            </p>
                            <button
                                onClick={() => router.push('/therapists')}
                                className="flex items-center gap-2 text-[#30bae8] font-bold hover:underline"
                            >
                                <span>Meet our therapists</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Testimonial */}
                <div className="px-4 py-4">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex gap-1 text-yellow-400 mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                        </div>
                        <p className="font-bold text-xl leading-snug mb-6">
                            "My therapist helped me prepare for my first college interview and calmed my nerves about moving out. It felt super productive."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">J</div>
                            <div>
                                <p className="font-bold text-sm">Jordan</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">High School Senior</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Important Notice */}
                <div className="px-4 mt-6">
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-2xl p-5">
                        <div className="flex items-start gap-4">
                            <Info className="w-6 h-6 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-yellow-900 dark:text-yellow-500 text-sm mb-2">Important Legal Notice</h4>
                                <p className="text-xs text-yellow-800 dark:text-yellow-400 leading-relaxed font-body">
                                    Safe Space provides <strong>life coaching and therapisting</strong>, which are distinct from medical or psychological treatment. Our services are educational and supportive in nature, focusing on personal development. We do <strong>not</strong> diagnose or treat mental health disorders.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="px-6 mt-12 mb-20 text-center">
                    <div className="h-px bg-gray-200 dark:bg-gray-800 w-full mb-8"></div>
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
                        <p className="text-sm text-red-600 dark:text-red-400 font-bold flex flex-col gap-2">
                            <span>In crisis? Please don't wait.</span>
                            <a href="tel:988" className="text-lg underline font-black">Call 988 for Suicide & Crisis Lifeline</a>
                        </p>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-8 font-medium font-body leading-relaxed">
                        © 2024 Safe Space Coaching. All rights reserved. <br />
                        Terms of Service • Privacy Policy
                    </p>
                </footer>
            </div>

            {/* FAB */}
            <div className="fixed bottom-10 right-10 z-50">
                <button
                    onClick={() => router.push('/signup')}
                    className="group flex items-center justify-center w-16 h-16 bg-[#30bae8] text-white rounded-3xl shadow-2xl shadow-[#30bae8]/40 transition-all duration-300 hover:scale-110 active:scale-95"
                >
                    <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                </button>
            </div>

        </div>
    );
}
