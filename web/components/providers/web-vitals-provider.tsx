'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

export function WebVitalsProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS === 'true') {
            reportWebVitals();
        }
    }, []);

    return <>{children}</>;
}
