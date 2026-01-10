'use client';

import React, { Component, ReactNode } from 'react';
import rollbar from '@/lib/rollbar';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Ignore NEXT_REDIRECT errors to allow Next.js usage of exceptions for control flow
        if (
            error.message === 'NEXT_REDIRECT' ||
            (error as any).digest?.startsWith('NEXT_REDIRECT')
        ) {
            // Re-throw to let Next.js handle the redirect
            throw error;
        }
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Don't log NEXT_REDIRECT errors to Rollbar
        if (
            error.message === 'NEXT_REDIRECT' ||
            (error as any).digest?.startsWith('NEXT_REDIRECT')
        ) {
            return;
        }

        rollbar.error(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
        });
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                            Something went wrong
                        </h2>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="mt-4 rounded-lg bg-primary px-4 py-2 text-white"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
