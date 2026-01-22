import { type Instrumentation } from 'next';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { rollbar } = await import('./lib/rollbar');
    // Initial warmup
    rollbar.info('Server instrumentation registered');
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  // Only run on nodejs runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { rollbar } = await import('./lib/rollbar');

    // Ignore NEXT_REDIRECT as it's a control flow exception
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      return;
    }

    rollbar.error(err, {
      context: 'onRequestError',
      request: {
        method: request.method,
        url: request.path,
      },
      routerKind: context.routerKind,
      routePath: context.routePath,
      revalidate: context.revalidate,
    });
  }
};
