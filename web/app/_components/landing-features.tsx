'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Compass, Ear, ArrowRight } from 'lucide-react';

export function LandingFeatures() {
    return (
        <section className="py-20 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Why are we here?</h2>
                    <p className="text-gray-500 mt-2 text-lg font-medium">A new way to navigate life's challenges.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-primary font-bold">
                    <span>Scroll to explore</span>
                    <ArrowRight className="w-5 h-5" />
                </div>
            </div>

            <div className="flex overflow-x-auto gap-8 pb-10 snap-x snap-mandatory no-scrollbar">
                <motion.div
                    whileHover={{ y: -10 }}
                    className="snap-center shrink-0 w-[300px] md:w-[380px] bg-white dark:bg-gray-800 p-8 rounded-[32px] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 flex flex-col gap-6"
                >
                    <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                        <Wind className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">Just Vent</h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                        Release the pressure valve. Talk about school, friends, or life without fear of judgment.
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ y: -10 }}
                    className="snap-center shrink-0 w-[300px] md:w-[380px] bg-white dark:bg-gray-800 p-8 rounded-[32px] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 flex flex-col gap-6"
                >
                    <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500">
                        <Compass className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">Find Direction</h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                        Feeling lost? Our coaches help you map out your next steps and set achievable goals.
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ y: -10 }}
                    className="snap-center shrink-0 w-[300px] md:w-[380px] bg-white dark:bg-gray-800 p-8 rounded-[32px] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 flex flex-col gap-6"
                >
                    <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500">
                        <Ear className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">Unbiased Ear</h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                        We aren't your parents or your teachers. We're just here to listen to your side of things.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
