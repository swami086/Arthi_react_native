import Rollbar from 'rollbar';

const rollbarConfig = {
  accessToken: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
  environment: process.env.NEXT_PUBLIC_ROLLBAR_ENVIRONMENT || process.env.NODE_ENV,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    client: {
      javascript: {
        source_map_enabled: true,
        code_version: process.env.NEXT_PUBLIC_ROLLBAR_CODE_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || '1.0.0',
        guess_uncaught_frames: true,
      },
    },
  },
};

// Create a singleton instance that works on both client and server
const rollbar = new Rollbar(rollbarConfig);

export { rollbar, rollbarConfig };
export default rollbar;
