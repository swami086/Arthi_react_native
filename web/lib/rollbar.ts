import Rollbar from 'rollbar';
import { sanitizeMetadata } from './metadata-sanitizer';

const IS_SERVER = typeof window === 'undefined';

// Unified configuration that detects current environment and runtime
const rollbarConfig: Rollbar.Configuration = {
  accessToken: IS_SERVER
    ? (process.env.ROLLBAR_READ_WRITE_TOKEN || process.env.ROLLBAR_SERVER_TOKEN)
    : process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
  environment: (IS_SERVER ? process.env.ROLLBAR_ENVIRONMENT : process.env.NEXT_PUBLIC_ROLLBAR_ENVIRONMENT) || 'production',
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    // Shared metadata across client and server
    code_version: process.env.NEXT_PUBLIC_ROLLBAR_CODE_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || '1.0.0',
    ...(IS_SERVER ? {
      server: {
        root: 'web-server',
        branch: process.env.VERCEL_GIT_COMMIT_REF || 'main',
      }
    } : {
      client: {
        javascript: {
          source_map_enabled: true,
          guess_uncaught_frames: true,
        }
      }
    })
  },
  // Security fields to scrub from payloads
  scrubFields: ['password', 'token', 'access_token', 'secret', 'credit_card', 'cvv', 'authorization', 'cookie', 'set-cookie'],
  scrubTelemetryInputs: true,
  // Custom checkIgnore to prevent NEXT_REDIRECT noise (often used in Next.js for control flow)
  checkIgnore: (isUncaught, args, payload: any) => {
    const message = (payload?.body?.message?.body || '').toString();
    // Ignore Next.js internal redirect exceptions
    if (message.includes('NEXT_REDIRECT') || message.includes('REDIRECT')) return true;
    return false;
  },
  transform: (payload: any) => {
    // Basic sanitization using the custom metadata-sanitizer
    if (payload?.data) {
      if (payload.data.person) {
        payload.data.person = sanitizeMetadata(payload.data.person);
      }
      if (payload.data.custom) {
        payload.data.custom = sanitizeMetadata(payload.data.custom);
      }
    }
  }
};

// Create a singleton instance
const rollbar = new Rollbar(rollbarConfig);

/**
 * Common logging functions for both client and server
 */
export const reportError = (error: any, context?: string, metadata?: any) => {
  rollbar.error(error, { context, ...metadata });
};

export const reportWarning = (message: string, context?: string, metadata?: any) => {
  rollbar.warning(message, { context, ...metadata });
};

export const reportInfo = (message: string, context?: string, metadata?: any) => {
  rollbar.info(message, { context, ...metadata });
};

export { rollbar, rollbarConfig };
export default rollbar;
