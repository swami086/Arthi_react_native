'use client';

import { useEffect } from 'react';
import { installBrowserLogCollector } from '@/lib/browser-console-collector';

/**
 * Mounts the browser console collector so all console.log/warn/error/info/debug
 * are forwarded to /api/local-log and written to browser.log (local-logs MCP).
 */
export function BrowserLogCollectorProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        installBrowserLogCollector();
    }, []);

    return <>{children}</>;
}
