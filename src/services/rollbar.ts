// @ts-ignore
import { Client, Configuration } from 'rollbar-react-native';
// @ts-ignore
import { ROLLBAR_ACCESS_TOKEN, ROLLBAR_ENVIRONMENT } from '@env';

const rollbarConfig = {
    accessToken: ROLLBAR_ACCESS_TOKEN || '952d416d0aa146639af1a0d99e7d2592',
    captureUncaught: true,
    captureUnhandledRejections: true,
    logLevel: 'debug',
    payload: {
        environment: ROLLBAR_ENVIRONMENT || (__DEV__ ? 'development' : 'production'),
        client: {
            javascript: {
                source_map_enabled: true,
                code_version: '1.0.0',
            },
        },
    },
    enabled: !!ROLLBAR_ACCESS_TOKEN,
    captureIp: false, // Privacy compliance
    scrubFields: ['password', 'token', 'access_token', 'secret', 'credit_card', 'cvv', 'card_number'],
};

// @ts-ignore
const rollbar: any = new Client(rollbarConfig);

export const reportError = (error: any, context?: string) => {
    let err = error;

    // Supabase errors are often plain objects with a 'message' property
    if (error && typeof error === 'object' && !error.name && !error.stack && error.message) {
        err = new Error(error.message);
        // Attach original error details to the new Error object for context
        (err as any).originalError = error;
        if (error.code) (err as any).code = error.code;
    } else if (typeof error === 'string') {
        err = new Error(error);
    }

    if (__DEV__) {
        console.error(`[Error] ${context || 'Unknown'}:`, error);
    }
    rollbar.error(err, { context, originalError: error });
};

export const reportInfo = (message: string, context?: string, metadata?: object) => {
    if (__DEV__) {
        console.log(`[Info] ${context || 'Unknown'}:`, message);
    }
    if (rollbarConfig.enabled) {
        rollbar.info(message, { context, ...metadata });
    }
};

export const reportWarning = (message: string, context?: string, metadata?: object) => {
    if (__DEV__) {
        console.warn(`[Warning] ${context || 'Unknown'}:`, message);
    }
    if (rollbarConfig.enabled) {
        rollbar.warning(message, { context, ...metadata });
    }
};

export const setRollbarUser = (userId: string, email?: string, username?: string, metadata?: object) => {
    if (!rollbarConfig.enabled) return;

    rollbar.configure({
        payload: {
            person: {
                id: userId,
                email: email,
                username: username,
                ...metadata
            }
        }
    });
};

export const clearRollbarUser = () => {
    if (!rollbarConfig.enabled) return;

    rollbar.configure({
        payload: {
            person: null
        }
    });
};

export default rollbar;
