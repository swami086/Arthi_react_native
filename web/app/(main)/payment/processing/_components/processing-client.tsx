'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProcessingClientProps {
    paymentId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export default function ProcessingClient({
    paymentId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
}: ProcessingClientProps) {
    const router = useRouter();
    const processedRef = useRef(false);

    useEffect(() => {
        if (processedRef.current) return;
        processedRef.current = true;

        const verify = async () => {
            try {
                const response = await fetch('/api/payment/success', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentId,
                        razorpayOrderId,
                        razorpayPaymentId,
                        razorpaySignature
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Success, redirect to success page
                    router.push(`/payment/success?paymentId=${paymentId}`);
                } else {
                    toast.error(result.error || 'Payment verification failed');
                    router.push('/appointments'); // Redirect to dashboard or retry
                }
            } catch (err) {
                toast.error('An unexpected error occurred during verification');
                router.push('/appointments');
            }
        };

        // Delay slightly for UX feel
        const timer = setTimeout(verify, 1500);
        return () => clearTimeout(timer);
    }, [paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature, router]);

    return (
        <motion.main
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full max-w-sm bg-[#1a2a2e] rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden ring-1 ring-white/5"
        >
            <div className="flex flex-col items-center px-6 pt-12 pb-8 gap-8">
                {/* Animated Spinner & Icon */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#30bae8]/10 rounded-full blur-xl scale-110"></div>
                    <div className="relative w-full h-full">
                        {/* Static Track */}
                        <div className="absolute inset-0 rounded-full border-4 border-[#243e47]"></div>
                        {/* Rotating Spinner */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#30bae8] border-r-[#30bae8]"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <CreditCard className="w-10 h-10 text-[#30bae8]" />
                        </div>
                    </div>
                </div>

                {/* Text Context */}
                <div className="text-center space-y-2">
                    <h1 className="text-white text-2xl font-bold tracking-tight">Processing Payment...</h1>
                    <p className="text-[#94a3b8] text-sm font-medium leading-relaxed max-w-[250px] mx-auto">
                        Please don't close the browser. This will only take a moment.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full space-y-2.5">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Encrypted Transfer</span>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-xs font-bold text-[#30bae8]"
                        >
                            75%
                        </motion.span>
                    </div>
                    <div className="h-2 w-full bg-[#243e47] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: '75%' }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            className="h-full bg-[#30bae8] rounded-full shadow-[0_0_12px_rgba(48,186,232,0.4)]"
                        />
                    </div>
                </div>

                {/* Secure Badge */}
                <div className="flex items-center gap-2 px-4 py-2 bg-[#243e47]/30 rounded-full border border-white/5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-300 text-xs font-semibold tracking-wide">
                        Secure Payment
                    </span>
                </div>
            </div>

            {/* Cancel Button */}
            <div className="pb-6 text-center border-t border-white/5 pt-4">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center justify-center px-6 py-2 rounded-full text-[#94a3b8] hover:text-white transition-colors"
                >
                    <span className="text-sm font-semibold">Cancel Payment</span>
                </button>
            </div>
        </motion.main>
    );
}
