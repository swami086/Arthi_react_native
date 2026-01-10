'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Minimal Dialog Implementation without Radix
interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

const DialogContext = React.createContext<{ open: boolean; onOpenChange: (open: boolean) => void } | null>(null);

function Dialog({ open, onOpenChange, children }: DialogProps) {
    // Controlled state
    return (
        <DialogContext.Provider value={{ open: !!open, onOpenChange: onOpenChange || (() => { }) }}>
            <AnimatePresence>
                {open && children}
            </AnimatePresence>
        </DialogContext.Provider>
    );
}

function DialogContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
    const context = React.useContext(DialogContext);
    if (!context?.open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => context.onOpenChange(false)}
            />
            {/* Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={cn(
                    "bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-lg p-6 relative z-50 mx-4 border border-slate-200 dark:border-slate-800",
                    className
                )}
            >
                {children}
                <button
                    onClick={() => context.onOpenChange(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            </motion.div>
        </div>
    );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}
            {...props}
        />
    )
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4", className)}
            {...props}
        />
    )
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn("text-lg font-semibold leading-none tracking-tight", className)}
            {...props}
        />
    )
}

// Basic DialogTrigger implementation
const DialogTrigger = React.forwardRef<HTMLButtonElement, { asChild?: boolean; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ asChild, children, onClick, ...props }, ref) => {
        const context = React.useContext(DialogContext);

        // If asChild is true, we should clone the child and pass the onClick handler
        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement, {
                onClick: (e: React.MouseEvent) => {
                    context?.onOpenChange(true);
                    (children as React.ReactElement).props.onClick?.(e);
                },
                ...props
            });
        }

        return (
            <button
                ref={ref}
                onClick={(e) => {
                    context?.onOpenChange(true);
                    onClick?.(e);
                }}
                {...props}
            >
                {children}
            </button>
        );
    }
);
DialogTrigger.displayName = "DialogTrigger";

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
            {...props}
        />
    )
}

export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger, DialogDescription };
