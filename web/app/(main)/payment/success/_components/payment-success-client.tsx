'use client';

import { motion } from 'framer-motion';
import {
    Check,
    Calendar,
    Clock,
    Hourglass,
    Download,
    CalendarPlus,
    MessageSquare,
    Video,
    Bell,
    Home
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';

interface PaymentSuccessClientProps {
    payment: any;
}

export default function PaymentSuccessClient({ payment }: PaymentSuccessClientProps) {
    const router = useRouter();
    const appointment = payment.appointment;
    const mentor = appointment?.mentor;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="relative flex min-h-screen w-full max-w-md flex-col overflow-x-hidden pb-6 bg-[#0e181b] shadow-2xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header / Success Animation Area */}
            <div className="flex flex-col items-center justify-center pt-12 pb-6 px-4 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                    className="relative mb-6"
                >
                    <div className="absolute inset-0 bg-[#10B981]/20 blur-xl rounded-full"></div>
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#10B981]/10 border-2 border-[#10B981]/30">
                        <Check className="w-12 h-12 text-[#10B981]" strokeWidth={3} />
                    </div>
                    {/* Decorative confetti dots */}
                    <motion.div
                        animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-2 -left-4 h-2 w-2 rounded-full bg-[#30bae8]"
                    />
                    <motion.div
                        animate={{ y: [0, 10, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="absolute top-0 -right-6 h-3 w-3 rounded-full bg-yellow-400"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        className="absolute -bottom-2 right-0 h-2 w-2 rounded-full bg-purple-400"
                    />
                </motion.div>
                <motion.h1 variants={itemVariants} className="text-3xl font-extrabold tracking-tight text-white mb-2">
                    Payment Successful!
                </motion.h1>
                <motion.p variants={itemVariants} className="text-[#93bac8] text-base">
                    You're all set for your session.
                </motion.p>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4 space-y-6">
                {/* Booking Confirmation Card */}
                <motion.section variants={itemVariants} className="bg-[#1a2a2e] rounded-[2rem] p-5 shadow-lg shadow-black/20 border border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#10B981]">
                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                        <p className="text-[#10B981] text-sm font-semibold tracking-wide uppercase">Your session is confirmed</p>
                    </div>

                    <div className="flex items-center gap-4 mb-5 border-b border-white/5 pb-5">
                        <div className="relative h-14 w-14 flex-shrink-0">
                            <img
                                className="h-full w-full rounded-full object-cover border border-white/10"
                                src={mentor?.avatar_url || 'https://via.placeholder.com/150'}
                                alt={mentor?.full_name}
                            />
                            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-[#10B981] border-2 border-[#1a2a2e]"></div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-white">{mentor?.full_name}</h2>
                            <p className="text-[#93bac8] text-sm">{mentor?.specialization}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#93bac8]">
                                <Calendar className="w-4.5 h-4.5 text-[#30bae8]" />
                                <span className="text-sm font-medium">
                                    {appointment?.start_time ? format(new Date(appointment.start_time), 'MMM dd, yyyy') : 'N/A'}
                                </span>
                            </div>
                            <div className="h-1 w-1 rounded-full bg-gray-600"></div>
                            <div className="flex items-center gap-2 text-[#93bac8]">
                                <Clock className="w-4.5 h-4.5 text-[#30bae8]" />
                                <span className="text-sm font-medium">
                                    {appointment?.start_time ? format(new Date(appointment.start_time), 'h:mm a') : 'N/A'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-2 text-[#93bac8]">
                                <Hourglass className="w-4.5 h-4.5 text-[#30bae8]" />
                                <span className="text-sm font-medium">45 Mins</span>
                            </div>
                            <div className="bg-[#0e181b] px-3 py-1 rounded-full border border-white/5">
                                <span className="text-xs font-mono text-gray-400">#{appointment?.id?.substring(0, 6).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Payment Receipt Card */}
                <motion.section variants={itemVariants} className="bg-[#1a2a2e] rounded-[2rem] p-5 shadow-lg shadow-black/20 border border-white/5">
                    <div className="flex items-end justify-between border-b border-white/5 pb-4 mb-4">
                        <div>
                            <p className="text-[#93bac8] text-xs font-medium mb-1">Total Amount Paid</p>
                            <p className="text-2xl font-bold text-white">₹{payment.amount}</p>
                        </div>
                        <div className="bg-[#30bae8]/10 px-2.5 py-1 rounded text-xs font-bold text-[#30bae8] mb-1">PAID</div>
                    </div>
                    <div className="space-y-3 mb-5 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[#93bac8]">Payment Method</span>
                            <span className="text-white font-medium">Razorpay</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#93bac8]">Transaction ID</span>
                            <span className="text-white font-medium font-mono text-xs">
                                {payment.razorpay_payment_id || 'N/A'}
                            </span>
                        </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 border border-[#30bae8]/30 rounded-xl py-3 text-[#30bae8] text-sm font-semibold hover:bg-[#30bae8]/5 transition-colors active:scale-[0.98]">
                        <Download className="w-4.5 h-4.5" />
                        Download Receipt
                    </button>
                </motion.section>

                {/* Next Steps Section */}
                <motion.section variants={itemVariants} className="pt-2 px-2">
                    <h3 className="text-white text-lg font-bold mb-4">What's Next?</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#1a2a2e] flex items-center justify-center text-[#30bae8]">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold">Confirmation sent</p>
                                <p className="text-[#93bac8] text-xs mt-0.5">Check your WhatsApp for details.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#1a2a2e] flex items-center justify-center text-[#30bae8]">
                                <Video className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold">Join the video call</p>
                                <p className="text-[#93bac8] text-xs mt-0.5">The link activates 5 mins before session.</p>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>

            {/* Sticky Bottom Actions */}
            <motion.div
                variants={itemVariants}
                className="mt-8 px-4 pb-8 pt-4 bg-[#0e181b]/95 backdrop-blur-sm z-10 sticky bottom-0"
            >
                <div className="flex flex-col gap-3">
                    <button className="w-full flex items-center justify-center gap-2 border border-white/20 rounded-full py-3.5 text-white text-sm font-semibold hover:bg-white/5 active:scale-[0.98] transition-all">
                        <CalendarPlus className="w-4.5 h-4.5" />
                        Add to Calendar
                    </button>
                    <button
                        onClick={() => router.push('/appointments')}
                        className="w-full flex items-center justify-center gap-2 bg-[#30bae8] rounded-full py-3.5 text-[#0e181b] text-base font-bold shadow-lg shadow-[#30bae8]/20 hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                        View Appointment
                    </button>
                    <Link
                        href="/home"
                        className="w-full py-2 text-[#93bac8] text-sm font-medium hover:text-white transition-colors text-center flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
}
