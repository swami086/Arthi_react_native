import Rollbar from 'rollbar';

let rollbar: Rollbar | null = null;

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./lib/rollbar-server');
  }
}

export { rollbar };
