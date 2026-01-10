export const dynamic = 'force-dynamic';

import ProcessingClient from './_components/processing-client';

interface ProcessingPageProps {
    searchParams: Promise<{
        paymentId?: string;
        razorpayOrderId?: string;
        razorpayPaymentId?: string;
        razorpaySignature?: string;
    }>;
}

export default async function PaymentProcessingPage({ searchParams }: ProcessingPageProps) {
    const {
        paymentId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    } = await searchParams;

    if (!paymentId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        // This page should only be reached after Razorpay callback
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0e181b]">
                <div className="text-white">Invalid transaction data</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0e181b] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-15%] right-[-15%] w-[300px] h-[300px] bg-[#30bae8]/10 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-[-15%] left-[-15%] w-[300px] h-[300px] bg-[#243e47]/30 rounded-full blur-[80px]"></div>
            </div>

            <ProcessingClient
                paymentId={paymentId}
                razorpayOrderId={razorpayOrderId}
                razorpayPaymentId={razorpayPaymentId}
                razorpaySignature={razorpaySignature}
            />
        </div>
    );
}
