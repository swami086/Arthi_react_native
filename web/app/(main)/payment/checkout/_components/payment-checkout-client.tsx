'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    Star,
    Calendar,
    Video,
    Wallet,
    CreditCard,
    Building2,
    Tag,
    Lock,
    ArrowRight,
    Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { usePayment } from '@/hooks/use-payment';
import { toast } from 'sonner';

interface PaymentCheckoutClientProps {
    appointment: any;
    user: {
        name: string;
        email: string;
        contact: string;
    };
}

export default function PaymentCheckoutClient({ appointment, user }: PaymentCheckoutClientProps) {
    const router = useRouter();
    const { startPayment, loading, error } = usePayment();
    const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
    const [promoCode, setPromoCode] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const sessionFee = appointment.price || 0;
    const platformFee = Math.round(sessionFee * 0.1);
    const totalAmount = sessionFee + platformFee;

    const therapist = appointment.therapist;

    const handleProceedToPay = async () => {
        if (!agreedToTerms) {
            toast.error('Please agree to the terms and conditions');
            return;
        }

        await startPayment(appointment.id, totalAmount, user);
    };

    return (
        <div className="relative w-full max-w-md bg-background-light dark:bg-[#0e181b] flex flex-col shadow-2xl rounded-[1rem] overflow-hidden min-h-[800px] max-h-[900px]">
            {/* Header */}
            <header className="flex items-center justify-between p-4 pb-2 bg-background-light dark:bg-[#0e181b] z-10 sticky top-0">
                <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" />
                </button>
                <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Payment Details</h1>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6 pb-32">
                {/* Appointment Summary Card */}
                <section className="bg-white dark:bg-[#1a2a2e] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="w-16 h-16 rounded-full bg-cover bg-center shrink-0 border-2 border-[#30bae8]/20"
                            style={{ backgroundImage: `url(${therapist?.avatar_url || 'https://via.placeholder.com/150'})` }}
                        ></div>
                        <div>
                            <h2 className="text-base font-bold dark:text-white text-slate-900">{therapist?.full_name}</h2>
                            <p className="text-sm text-slate-500 dark:text-[#94aeb8] font-medium">{therapist?.specialization}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="w-4 h-4 text-[#30bae8] fill-[#30bae8]" />
                                <span className="text-xs font-bold dark:text-white text-slate-900">{therapist?.rating_average || '5.0'}</span>
                                <span className="text-xs text-slate-500 dark:text-[#94aeb8]">({therapist?.total_sessions || 0} reviews)</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-white/5 w-full my-3"></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#30bae8]/10 flex items-center justify-center shrink-0">
                                <Calendar className="w-4.5 h-4.5 text-[#30bae8]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-[#94aeb8] font-bold">Date & Time</span>
                                <span className="text-xs font-semibold dark:text-white text-slate-900">
                                    {format(new Date(appointment.start_time), 'MMM dd • h:mm a')}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#30bae8]/10 flex items-center justify-center shrink-0">
                                <Video className="w-4.5 h-4.5 text-[#30bae8]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-[#94aeb8] font-bold">Type</span>
                                <span className="text-xs font-semibold dark:text-white text-slate-900">Video • 45 mins</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Payment Methods */}
                <section>
                    <h3 className="text-base font-bold mb-3 px-1 dark:text-white text-slate-900">Payment Methods</h3>
                    <div className="space-y-3">
                        {/* UPI */}
                        <label
                            className={`relative flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1a2a2e] border-2 cursor-pointer transition-all ${paymentMethod === 'upi'
                                    ? 'border-[#30bae8] shadow-md shadow-[#30bae8]/5'
                                    : 'border-transparent hover:border-slate-200 dark:hover:border-white/10'
                                }`}
                            onClick={() => setPaymentMethod('upi')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                    <Wallet className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-[#30bae8]' : 'text-slate-500 dark:text-[#94aeb8]'}`} />
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${paymentMethod === 'upi' ? 'dark:text-white text-slate-900' : 'text-slate-600 dark:text-[#94aeb8]'}`}>UPI</p>
                                    <p className="text-xs text-slate-500 dark:text-[#94aeb8]">GPay, PhonePe, Paytm</p>
                                </div>
                            </div>
                            <input
                                type="radio"
                                name="payment_method"
                                checked={paymentMethod === 'upi'}
                                onChange={() => setPaymentMethod('upi')}
                                className="w-5 h-5 text-[#30bae8] border-slate-300 dark:border-slate-600 focus:ring-[#30bae8] focus:ring-offset-0 bg-transparent"
                            />
                        </label>

                        {/* Card */}
                        <label
                            className={`relative flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1a2a2e] border-2 cursor-pointer transition-all ${paymentMethod === 'card'
                                    ? 'border-[#30bae8] shadow-md shadow-[#30bae8]/5'
                                    : 'border-transparent hover:border-slate-200 dark:hover:border-white/10'
                                }`}
                            onClick={() => setPaymentMethod('card')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-[#30bae8]' : 'text-slate-500 dark:text-[#94aeb8]'}`} />
                                </div>
                                <p className={`text-sm font-bold ${paymentMethod === 'card' ? 'dark:text-white text-slate-900' : 'text-slate-600 dark:text-[#94aeb8]'}`}>Credit / Debit Card</p>
                            </div>
                            <input
                                type="radio"
                                name="payment_method"
                                checked={paymentMethod === 'card'}
                                onChange={() => setPaymentMethod('card')}
                                className="w-5 h-5 text-[#30bae8] border-slate-300 dark:border-slate-600 focus:ring-[#30bae8] focus:ring-offset-0 bg-transparent"
                            />
                        </label>

                        {/* Net Banking */}
                        <label
                            className={`relative flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1a2a2e] border-2 cursor-pointer transition-all ${paymentMethod === 'netbanking'
                                    ? 'border-[#30bae8] shadow-md shadow-[#30bae8]/5'
                                    : 'border-transparent hover:border-slate-200 dark:hover:border-white/10'
                                }`}
                            onClick={() => setPaymentMethod('netbanking')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                    <Building2 className={`w-6 h-6 ${paymentMethod === 'netbanking' ? 'text-[#30bae8]' : 'text-slate-500 dark:text-[#94aeb8]'}`} />
                                </div>
                                <p className={`text-sm font-bold ${paymentMethod === 'netbanking' ? 'dark:text-white text-slate-900' : 'text-slate-600 dark:text-[#94aeb8]'}`}>Net Banking</p>
                            </div>
                            <input
                                type="radio"
                                name="payment_method"
                                checked={paymentMethod === 'netbanking'}
                                onChange={() => setPaymentMethod('netbanking')}
                                className="w-5 h-5 text-[#30bae8] border-slate-300 dark:border-slate-600 focus:ring-[#30bae8] focus:ring-offset-0 bg-transparent"
                            />
                        </label>
                    </div>
                </section>

                {/* Promo Code */}
                <section className="bg-white dark:bg-[#1a2a2e] rounded-2xl p-2 flex gap-2 items-center border border-slate-100 dark:border-white/5 focus-within:border-[#30bae8]/50 transition-colors">
                    <div className="pl-3">
                        <Tag className="w-5 h-5 text-[#30bae8]" />
                    </div>
                    <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-2 dark:text-white text-slate-900 placeholder:text-slate-400 dark:placeholder:text-[#94aeb8]/50"
                        placeholder="Enter promo code"
                    />
                    <button className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-xs font-bold rounded-xl text-[#30bae8] transition-colors">
                        Apply
                    </button>
                </section>

                {/* Payment Breakdown */}
                <section className="bg-white dark:bg-[#1a2a2e] rounded-2xl p-4 space-y-3 border border-slate-100 dark:border-white/5">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-[#94aeb8]">Session Fee</span>
                        <span className="font-medium dark:text-white text-slate-900">₹{sessionFee}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-[#94aeb8]">Platform Fee (10%)</span>
                        <span className="font-medium dark:text-white text-slate-900">₹{platformFee}</span>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-white/5 w-full my-1"></div>
                    <div className="flex justify-between items-center text-base">
                        <span className="font-bold text-slate-600 dark:text-[#94aeb8]">Total Amount</span>
                        <span className="font-extrabold text-lg text-[#30bae8]">₹{totalAmount}</span>
                    </div>
                </section>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 px-2">
                    <div className="relative flex items-center h-5">
                        <input
                            id="terms"
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="w-5 h-5 cursor-pointer rounded-md border-2 border-slate-400 dark:border-[#94aeb8] bg-transparent text-[#30bae8] focus:ring-[#30bae8]"
                        />
                    </div>
                    <label htmlFor="terms" className="text-xs leading-relaxed text-slate-500 dark:text-[#94aeb8] cursor-pointer select-none">
                        I agree to the <button className="text-[#30bae8] hover:underline">Terms of Service</button> and <button className="text-[#30bae8] hover:underline">Cancellation Policy</button>.
                    </label>
                </div>
            </main>

            {/* Fixed Footer */}
            <footer className="bg-white dark:bg-[#1a2a2e]/95 backdrop-blur-md p-4 pt-4 pb-10 border-t border-slate-100 dark:border-white/5 absolute bottom-0 w-full z-20 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                <button
                    onClick={handleProceedToPay}
                    disabled={loading}
                    className="w-full bg-[#30bae8] hover:bg-[#30bae8]/90 text-white font-bold py-4 rounded-full shadow-lg shadow-[#30bae8]/25 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            <span>Processing...</span>
                        </div>
                    ) : (
                        <>
                            <span>Proceed to Pay</span>
                            <span className="font-extrabold">₹{totalAmount}</span>
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
                <div className="flex items-center justify-center gap-1.5 opacity-60">
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-[#94aeb8]" />
                    <span className="text-[10px] font-medium text-slate-400 dark:text-[#94aeb8] uppercase tracking-wide">100% Safe & Secured by Razorpay</span>
                </div>
            </footer>
        </div>
    );
}
