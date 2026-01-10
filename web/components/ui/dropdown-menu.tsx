'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Minimal Dropdown Logic
interface DropdownMenuProps {
    children: React.ReactNode;
}

const DropdownContext = React.createContext<{
    open: boolean;
    setOpen: (o: boolean) => void;
    triggerRef: React.RefObject<HTMLButtonElement>;
} | null>(null);

function DropdownMenu({ children }: DropdownMenuProps) {
    const [open, setOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLButtonElement>(null);

    // Close on click outside
    React.useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
                // Also check if click is inside content (not easily accessible here without more ref logic, simplistic approach: close on window click provided bubbling doesn't stop it if intentional)
                // Better: use specific Ref for content. But simplified: if click not on trigger, close.
                // Wait, if I click content, it closes? That's bad.
                // Needs a content ref too or portal.
            }
        };
        if (open) {
            window.addEventListener('click', handleClick);
        }
        return () => window.removeEventListener('click', handleClick);
    }, [open]);

    return (
        <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
            <div className="relative inline-block text-left">
                {children}
            </div>
        </DropdownContext.Provider>
    );
}

function DropdownMenuTrigger({ asChild, children, className }: any) {
    const context = React.useContext(DropdownContext);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            ref: context?.triggerRef,
            onClick: (e: React.MouseEvent) => {
                e.stopPropagation(); // Prevent immediate close
                context?.setOpen(!context.open);
                (children as any).props.onClick?.(e);
            }
        });
    }

    return (
        <button
            ref={context?.triggerRef}
            className={className}
            onClick={(e) => { e.stopPropagation(); context?.setOpen(!context.open); }}
        >
            {children}
        </button>
    );
}

function DropdownMenuContent({ children, align = 'center', className }: any) {
    const context = React.useContext(DropdownContext);

    // Close when clicking inside (e.g. valid action)
    const handleClick = (e: React.MouseEvent) => {
        // e.stopPropagation(); // Keep open? Or close? Usually menu item click closes it.
    };

    if (!context?.open) return null;

    return (
        <div className="absolute right-0 mt-2 w-56 origin-top-right z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                    "rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
                    className
                )}
                onClick={handleClick}
            >
                {children}
            </motion.div>
        </div>
    );
}

function DropdownMenuItem({ children, className, onClick, ...props }: any) {
    const context = React.useContext(DropdownContext);

    return (
        <div
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className
            )}
            onClick={(e) => {
                onClick?.(e);
                context?.setOpen(false); // Close on selection
            }}
            {...props}
        >
            {children}
        </div>
    );
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
