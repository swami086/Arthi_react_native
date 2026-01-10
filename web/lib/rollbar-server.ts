import Rollbar from 'rollbar';
import { sanitizeMetadata } from './metadata-sanitizer';

export const rollbarServer = new Rollbar({
    accessToken: process.env.ROLLBAR_READ_WRITE_TOKEN || process.env.ROLLBAR_SERVER_TOKEN,
    environment: process.env.ROLLBAR_ENVIRONMENT || 'production',
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
        server: {
            root: 'web-server',
            branch: process.env.VERCEL_GIT_COMMIT_REF || 'main',
        },
        code_version: process.env.VERCEL_GIT_COMMIT_SHA || '1.0.0',
    },
    scrubFields: ['password', 'token', 'access_token', 'secret', 'credit_card', 'cvv', 'authorization'],
    checkIgnore: (isUncaught, args, payload: any) => {
        const message = (payload?.body?.message?.body || '').toString();
        if (message.includes('NEXT_REDIRECT')) return true;
        return false;
    },
    transform: (payload: any) => {
        // Basic sanitization
        if (payload?.data?.person) {
            payload.data.person = sanitizeMetadata(payload.data.person);
        }
        if (payload?.data?.custom) {
            payload.data.custom = sanitizeMetadata(payload.data.custom);
        }
    }
});

export const reportServerError = (error: any, context?: string, metadata?: any) => {
    rollbarServer.error(error, { context, ...metadata });
};

export const reportServerInfo = (message: string, context?: string, metadata?: any) => {
    rollbarServer.info(message, { context, ...metadata });
};

export const reportServerWarning = (message: string, context?: string, metadata?: any) => {
    rollbarServer.warning(message, { context, ...metadata });
};
