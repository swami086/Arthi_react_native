import Rollbar from 'rollbar';

const rollbarConfig: Rollbar.Configuration = {
    accessToken: typeof window === 'undefined'
        ? process.env.ROLLBAR_SERVER_TOKEN
        : process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
    environment: process.env.NEXT_PUBLIC_ROLLBAR_ENVIRONMENT || process.env.NODE_ENV || 'development',
    captureUncaught: true,
    captureUnhandledRejections: true,
    checkIgnore: (isUncaught, args, payload) => {
        const error = args[0] as any;
        // Ignore Next.js-specific errors that are actually control flow
        const payloadBody = (payload as any)?.body?.message?.body;
        if (
            error?.message === 'NEXT_REDIRECT' ||
            error?.digest?.startsWith('NEXT_REDIRECT') ||
            payloadBody?.message === 'NEXT_REDIRECT'
        ) {
            return true;
        }
        return false;
    },
    payload: {
        client: {
            javascript: {
                source_map_enabled: true,
                code_version: process.env.NEXT_PUBLIC_ROLLBAR_CODE_VERSION || '1.0.0',
                guess_uncaught_frames: true
            }
        }
    }
};

let rollbar: Rollbar;

if (typeof window === 'undefined') {
    // Server-side
    rollbar = new Rollbar({
        ...rollbarConfig,
        accessToken: process.env.ROLLBAR_SERVER_TOKEN, // Exclusively server token
    });
} else {
    // Client-side
    rollbar = new Rollbar({
        ...rollbarConfig,
        accessToken: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN, // Exclusively client token
    });
}

export default rollbar;
export { rollbarConfig };

