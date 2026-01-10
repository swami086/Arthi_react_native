'use client';
import { Button } from '@/components/ui/button';
import { reportError } from '@/lib/rollbar-utils';
import { logToLocal } from '@/lib/local-logger'; // Import logger

export default function TestRollbarPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Rollbar & Local Logs Test</h1>
      <div className="flex gap-4">
        <Button onClick={() => {
          console.log('Test error triggered');
          try {
            throw new Error('Test error from button click');
          } catch (e) {
            reportError(e);
          }
        }}>
          Trigger Rollbar Error
        </Button>

        <Button variant="outline" onClick={() => {
          logToLocal('This is a test log from the browser!', 'info');
          alert('Log sent to browser.log');
        }}>
          Log to Local File
        </Button>
      </div>
    </div>
  );
}
