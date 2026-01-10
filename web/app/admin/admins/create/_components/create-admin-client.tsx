'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Shield,
    ArrowLeft,
    Send,
    Info,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { createAdminAction } from '../../../_actions/adminActions';
import { toast } from 'sonner';

export default function CreateAdminClient() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        isSuperAdmin: false
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email address is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const res = await createAdminAction(
                formData.email,
                formData.fullName,
                formData.isSuperAdmin
            );

            if (res.success) {
                toast.success('Admin invitation sent successfully!');
                router.push('/admin/admins');
                router.refresh();
            } else {
                toast.error((res as any).error || 'Failed to create admin');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-xl h-12 w-12 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        New <span className="text-primary">Admin</span>
                    </h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                        Expand the management team
                    </p>
                </div>
            </div>

            {/* Info Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10 flex items-start gap-4 relative overflow-hidden"
            >
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Info className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-black text-primary text-sm uppercase tracking-widest mb-1">Administrative Privileges</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-bold leading-relaxed">
                        Administrators can review therapist applications, manage users, and view platform metrics. Super admins have the additional ability to manage the admin team.
                    </p>
                </div>
            </motion.div>

            {/* Creation Form */}
            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#1a2c32] rounded-[2.5rem] p-10 border border-gray-100 dark:border-border-dark shadow-sm space-y-8"
            >
                <div className="space-y-6">
                    <Input
                        label="Full Name"
                        placeholder="e.g. John Doe"
                        leftIcon={User}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        error={errors.fullName}
                    />

                    <Input
                        label="Email Address"
                        placeholder="john@example.com"
                        leftIcon={Mail}
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={errors.email}
                    />

                    <div className="pt-4">
                        <label className="mb-4 block text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            Account Hierarchy
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isSuperAdmin: false })}
                                className={cn(
                                    "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left",
                                    !formData.isSuperAdmin
                                        ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                                        : "border-gray-50 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50"
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                    !formData.isSuperAdmin ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                )}>
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className={cn("font-black text-sm uppercase tracking-tight", !formData.isSuperAdmin ? "text-primary" : "text-gray-500")}>
                                        System Admin
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400">Regular management access</p>
                                </div>
                                {!formData.isSuperAdmin && <CheckCircle2 className="h-5 w-5 ml-auto text-primary" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isSuperAdmin: true })}
                                className={cn(
                                    "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left",
                                    formData.isSuperAdmin
                                        ? "border-indigo-500 bg-indigo-500/5 ring-4 ring-indigo-500/5"
                                        : "border-gray-50 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50"
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                    formData.isSuperAdmin ? "bg-indigo-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                )}>
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className={cn("font-black text-sm uppercase tracking-tight", formData.isSuperAdmin ? "text-indigo-600" : "text-gray-500")}>
                                        Super Admin
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400">Full control & auditing</p>
                                </div>
                                {formData.isSuperAdmin && <CheckCircle2 className="h-5 w-5 ml-auto text-indigo-500" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full h-16 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-primary/20"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                Send Management Invitation
                            </>
                        )}
                    </Button>
                    <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6">
                        Personalized invitation will be sent to the email provided
                    </p>
                </div>
            </motion.form>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
