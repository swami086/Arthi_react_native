'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const Progress = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value?: number }
>(({ className, value, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
            className
        )}
        {...props}
    >
        <motion.div
            className="h-full w-full flex-1 bg-slate-900 dark:bg-slate-50 transition-all"
            initial={{ translateX: '-100%' }}
            animate={{ translateX: `-${100 - (value || 0)}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
    </div>
))
Progress.displayName = "Progress"

export { Progress }
