import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./test/setup.ts'],
        alias: {
            '@': path.resolve(__dirname, './'),
        },
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                '.next/',
                'e2e/',
                '**/*.d.ts',
                'test/setup.ts',
            ],
        },
        include: ['**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules/', '.next/', 'e2e/'],
    },
});
