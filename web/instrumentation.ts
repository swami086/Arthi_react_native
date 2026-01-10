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
      checkIgnore: (isUncaught, args, payload) => {
        const message = ((payload as any).body.message?.body || '').toString();
        if (message.includes('NEXT_REDIRECT')) return true;
        return false;
      },
      transform: (payload) => {
        const p = payload as any;
        if (p.data.person) {
          p.data.person = sanitizeMetadata(p.data.person);
        }
        if (p.data.custom) {
          p.data.custom = sanitizeMetadata(p.data.custom);
        }
      }
    });
  }
}

export { rollbar };
