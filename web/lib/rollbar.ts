import Rollbar from 'rollbar';

let rollbarInstance: Rollbar | null = null;

if (typeof window !== 'undefined') {
  rollbarInstance = new Rollbar({
    accessToken: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
    environment: process.env.NEXT_PUBLIC_ROLLBAR_ENVIRONMENT || process.env.NODE_ENV,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });
}

export const rollbar = rollbarInstance;
export const rollbarConfig = {
  accessToken: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
  environment: process.env.NEXT_PUBLIC_ROLLBAR_ENVIRONMENT || process.env.NODE_ENV,
  captureUncaught: true,
  captureUnhandledRejections: true,
};
