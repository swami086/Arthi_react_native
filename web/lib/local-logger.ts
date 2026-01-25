/**
 * Sends a log message to the local dev file via /api/local-log (browser.log).
 * All console.log/warn/error/info/debug are also collected automatically
 * via BrowserLogCollectorProvider and written to the same file (local-logs MCP).
 */
export const logToLocal = async (message: string | object, level: 'info' | 'warn' | 'error' = 'info') => {
    if (process.env.NODE_ENV !== 'development') return;

    try {
        await fetch('/api/local-log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                level,
                timestamp: new Date().toISOString(),
            }),
        });
    } catch (e) {
        // Fail silently - it's just dev logging
        console.error('Failed to send log to local file', e);
    }
};
