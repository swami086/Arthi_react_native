'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function AdminLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/5"
            >
                <Shield className="h-10 w-10 animate-pulse" />
            </motion.div>

            <div className="flex flex-col items-center gap-2">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                    Securing <span className="text-primary">Workspace</span>
                </h3>
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                opacity: [0.3, 1, 0.3],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                            className="h-1.5 w-1.5 rounded-full bg-primary"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
