'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageview, trackEvent } from '@/lib/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true') {
            trackPageview();
        }
    }, [pathname, searchParams]);

    return <>{children}</>;
}

export const useAnalytics = () => {
    return {
        trackEvent,
    };
};
