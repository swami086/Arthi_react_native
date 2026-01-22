import React from 'react';
import { ShieldAlert, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-md w-full text-center space-y-8 p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/40 rounded-[2.5rem] flex items-center justify-center animate-pulse">
                    <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Access Denied</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-4">
                        You don&apos;t have the required permissions to access this area of the workplace.
                    </p>
                </div>

                <div className="pt-4">
                    <Link href="/login">
                        <Button className="w-full h-14 rounded-2xl font-black text-lg gap-3" variant="primary">
                            <Home className="w-5 h-5" />
                            Return to Login
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
