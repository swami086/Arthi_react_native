'use client';

import React, { Component, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "./button";
import { reportError } from "@/lib/rollbar-utils";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    context?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        const context = this.props.context ? `[${this.props.context}] ` : '';
        reportError(error, `${context}ErrorBoundary Catch: ${error.message} (Component Stack: ${errorInfo.componentStack})`);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-gray-50/30 dark:bg-[#0f191d]/30 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-gray-800 transition-all duration-500 hover:border-primary/20">
                    <motion.div
                        initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        className="w-20 h-20 bg-red-100/50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center text-red-600 mb-8 shadow-xl shadow-red-500/10"
                    >
                        <AlertTriangle size={40} className="stroke-[2.5px]" />
                    </motion.div>

                    <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-4">
                        A small gravity leak...
                    </h2>

                    <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto mb-10 font-medium leading-relaxed">
                        The component encountered an unexpected trajectory deviation. Our engineers have been notified.
                        <span className="block mt-2 text-red-500/80 font-mono text-[11px] font-black uppercase tracking-widest">
                            Error: {this.state.error?.message || 'Unknown Physics Failure'}
                        </span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Button
                            variant="outline"
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="px-8 h-12 rounded-2xl border-gray-200 dark:border-border-dark font-black uppercase tracking-widest text-[11px]"
                        >
                            Try to Resume
                        </Button>

                        <Button
                            onClick={this.handleReset}
                            className="px-8 h-12 rounded-2xl shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-[11px]"
                            leftIcon={<RefreshCcw size={16} className="stroke-[2.5px]" />}
                        >
                            Re-initialize System
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
