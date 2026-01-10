import { reportError } from '../rollbar-utils';

export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined') {
            resolve(false);
            return;
        }

        // Check if script already loaded
        if ((window as any).Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;

        script.onload = () => {
            resolve(true);
        };

        script.onerror = () => {
            reportError(new Error('Razorpay SDK failed to load'), 'razorpay-loader');
            resolve(false);
        };

        document.head.appendChild(script);
    });
};
