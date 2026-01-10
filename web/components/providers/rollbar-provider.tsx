'use client';

import { Provider } from '@rollbar/react';
import { rollbarConfig } from '@/lib/rollbar';
import { ReactNode } from 'react';

export function RollbarProvider({ children }: { children: ReactNode }) {
    return (
        <Provider config={rollbarConfig}>
            {children}
        </Provider>
    );
}
