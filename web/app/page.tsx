import React from 'react';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { generateMetadata } from '@/lib/metadata';
export const dynamic = 'force-dynamic';
import { LandingHeader } from './_components/landing-header';
import { LandingHero } from './_components/landing-hero';
import { LandingFeatures } from './_components/landing-features';
import { LandingCTA } from './_components/landing-cta-client';

export const metadata = generateMetadata({
  title: 'SafeSpace - Mental Health Support Platform',
  description: 'Connect with therapists for mental health support, life coaching, and personal growth. Find your safe space today.',
  path: '/',
});

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-text-primary-light dark:text-text-primary-dark selection:bg-primary/30 selection:text-primary-dark transition-colors duration-300">

      <LandingHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">

        <LandingHero />
        <LandingFeatures />

        {/* Audience Section */}
        <section className="py-12">
          <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-[40px] p-8 md:p-16 relative overflow-hidden border border-blue-100 dark:border-gray-700">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">For Students & Teens</h2>
                <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  Whether you're stressing about finals, friendship drama, or just feeling "off"—we're here. We are therapists, not doctors.
                </p>
                <Link href="/about" className="inline-flex items-center gap-2 text-primary font-bold text-lg hover:underline underline-offset-8">
                  Learn how it works <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden shadow-xl">
                      <Image
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                        alt="Therapist"
                        width={80}
                        height={80}
                      />
                    </div>
                  ))}
                  <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 bg-primary/20 flex items-center justify-center text-primary font-bold text-xl backdrop-blur-sm">
                    +40
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20 flex flex-col items-center gap-12 text-center">
          <div className="max-w-3xl">
            <div className="flex justify-center gap-1 text-yellow-500 mb-8">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-8 h-8 fill-current" />)}
            </div>
            <blockquote className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-text-primary-light dark:text-text-primary-dark">
              "I was scared to talk to a therapist, but this felt just like talking to a cool older sibling. I feel so much lighter."
            </blockquote>
            <div className="mt-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-2xl">A</div>
              <p className="text-xl font-bold">Alex, <span className="text-gray-400 font-medium">College Sophomore</span></p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-20 pb-40">
          <div className="h-px bg-gray-100 dark:bg-gray-800 w-full mb-12"></div>
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold text-primary">SafeSpace</span>
            </div>
            <p className="text-sm font-medium text-gray-400 text-center max-w-md leading-relaxed">
              <span className="font-bold text-gray-600 dark:text-gray-300">Disclaimer:</span> Safe Space is not a medical service. We do not diagnose or treat mental health disorders.
            </p>
            <div className="p-6 bg-status-error/5 rounded-3xl border border-status-error/10 text-center">
              <p className="text-lg text-status-error font-bold mb-2">In crisis? Please don't wait.</p>
              <a href="tel:988" className="text-2xl font-black underline hover:text-status-error/80 transition-colors">Call 988 for Suicide & Crisis Lifeline</a>
            </div>
          </div>
        </footer>

      </main>

      <LandingCTA />

    </div>
  );
}
