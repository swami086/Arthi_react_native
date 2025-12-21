// Import Rollbar for Deno
import Rollbar from 'npm:rollbar@2.26.5';

const rollbar = new Rollbar({
    accessToken: Deno.env.get('ROLLBAR_SERVER_ACCESS_TOKEN') || '',
    environment: Deno.env.get('ROLLBAR_ENVIRONMENT') || 'production',
    captureUncaught: false, // Handle manually in Deno
    captureUnhandledRejections: false,
    enabled: !!Deno.env.get('ROLLBAR_SERVER_ACCESS_TOKEN'),
    payload: {
        server: {
            root: 'supabase-functions',
        },
    },
});

export const reportError = (error: any, context?: string, metadata?: Record<string, any>): Promise<void> => {
    console.error(`[Error] ${context || 'Unknown'}:`, error);
    if (rollbar.options.enabled) {
        return new Promise((resolve) => {
            rollbar.error(error, { context, ...metadata }, (err) => {
                if (err) console.error("Rollbar reporting failed:", err);
                resolve();
            });
        });
    }
    return Promise.resolve();
};

export const reportInfo = (message: string, context?: string, metadata?: Record<string, any>): Promise<void> => {
    console.log(`[Info] ${context || 'Unknown'}:`, message);
    if (rollbar.options.enabled) {
        return new Promise((resolve) => {
            rollbar.info(message, { context, ...metadata }, (err) => {
                if (err) console.error("Rollbar reporting failed:", err);
                resolve();
            });
        });
    }
    return Promise.resolve();
};

export const reportWarning = (message: string, context?: string, metadata?: Record<string, any>): Promise<void> => {
    console.warn(`[Warning] ${context || 'Unknown'}:`, message);
    if (rollbar.options.enabled) {
        return new Promise((resolve) => {
            rollbar.warning(message, { context, ...metadata }, (err) => {
                if (err) console.error("Rollbar reporting failed:", err);
                resolve();
            });
        });
    }
    return Promise.resolve();
};

export default rollbar;
