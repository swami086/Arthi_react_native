import Plausible from 'plausible-tracker';
import { shouldTrace } from './rollbar-utils';

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const PLAUSIBLE_API_HOST = process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST;

let plausible: ReturnType<typeof Plausible> | null = null;

if (typeof window !== 'undefined' && PLAUSIBLE_DOMAIN) {
    plausible = Plausible({
        domain: PLAUSIBLE_DOMAIN,
        apiHost: PLAUSIBLE_API_HOST || 'https://plausible.io',
        trackLocalhost: process.env.NODE_ENV === 'development',
    });
}

export const trackPageview = () => {
    if (plausible) {
        plausible.trackPageview();
    }
};

export const trackEvent = (eventName: string, props?: Record<string, string | number | boolean>) => {
    if (plausible) {
        plausible.trackEvent(eventName, { props });
    }
};

/**
 * Standard events list
 */
export const AnalyticsEvents = {
    SIGN_UP: 'sign_up',
    SIGN_IN: 'sign_in',
    BOOKING_COMPLETED: 'booking_completed',
    PAYMENT_SUCCESS: 'payment_success',
    VIDEO_CALL_STARTED: 'video_call_started',
    ERROR_BOUNDARY_SHOWN: 'error_boundary_shown',
};
