import Rollbar from 'rollbar';

let rollbar: Rollbar | null = null;

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { sanitizeMetadata } = await import('./lib/metadata-sanitizer');

    rollbar = new Rollbar({
      accessToken: process.env.ROLLBAR_SERVER_TOKEN,
      environment: process.env.NEXT_PUBLIC_ROLLBAR_ENVIRONMENT || process.env.NODE_ENV,
      captureUncaught: true,
      captureUnhandledRejections: true,
      checkIgnore: (isUncaught, args, payload: { body?: { message?: { body?: string } } }) => {
        const message = (payload?.body?.message?.body || '').toString();
        if (message.includes('NEXT_REDIRECT')) return true;
        return false;
      },
      transform: (payload: { data?: { person?: unknown; custom?: unknown } }) => {
        if (payload?.data?.person) {
          payload.data.person = sanitizeMetadata(payload.data.person);
        }
        if (payload?.data?.custom) {
          payload.data.custom = sanitizeMetadata(payload.data.custom);
        }
      }
    });
  }
}

export { rollbar };
