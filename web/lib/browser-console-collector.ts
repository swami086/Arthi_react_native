/**
 * Patches console.log/warn/error/info/debug and forwards all browser logs
 * to the local-log API so they appear in browser.log (readable by local-logs MCP).
 * Only runs in development + browser. Uses raw console for internal errors to avoid loops.
 */

const IS_DEV = process.env.NODE_ENV === 'development';
const IS_BROWSER = typeof window !== 'undefined';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function serializeArgs(args: unknown[]): string {
    return args
        .map((a) => {
            if (a === null) return 'null';
            if (a === undefined) return 'undefined';
            if (typeof a === 'object') return JSON.stringify(a);
            return String(a);
        })
        .join(' ');
}

async function sendToLocal(level: LogLevel, message: string | object): Promise<void> {
    try {
        await fetch('/api/local-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                level,
                message,
                timestamp: new Date().toISOString(),
            }),
        });
    } catch (e) {
        orig.error('[browser-console-collector] Failed to send log to local file', e);
    }
}

let orig: { log: typeof console.log; warn: typeof console.warn; error: typeof console.error; info: typeof console.info; debug: typeof console.debug } | null = null;

export function installBrowserLogCollector(): void {
    if (!IS_DEV || !IS_BROWSER || typeof console === 'undefined') return;
    if (orig) return; // already installed

    orig = {
        log: console.log.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        info: (console.info ?? console.log).bind(console),
        debug: (console.debug ?? console.log).bind(console),
    };

    const patch = (level: LogLevel) => {
        return (...args: unknown[]) => {
            const msg = serializeArgs(args);
            sendToLocal(level, msg);
            const fn = orig![level] ?? orig!.log;
            fn(...args);
        };
    };

    console.log = patch('info');
    console.warn = patch('warn');
    console.error = patch('error');
    console.info = patch('info');
    console.debug = patch('debug');
}
