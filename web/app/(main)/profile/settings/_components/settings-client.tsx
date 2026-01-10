'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import {
    Moon, Sun, Laptop, Bell, Shield, Download, Trash2,
    HelpCircle, MessageSquare, FileText, LogOut, ArrowLeft,
    ChevronRight, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { exportUserData, requestAccountDeletion, updateNotificationPreferences } from '@/app/actions/profile';
import { signOut } from '@/app/actions/auth';
import { slideUp, staggerContainer } from '@/lib/animation-variants';
import { toast } from 'sonner';
import { addBreadcrumb, reportInfo } from '@/lib/rollbar-utils';

interface SettingsClientProps {
    user: any;
    profile: any;
}

export default function SettingsClient({ user, profile }: SettingsClientProps) {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [preferences, setPreferences] = useState({
        email: profile?.notification_preferences?.email ?? true,
        push: profile?.notification_preferences?.push ?? true,
        reminders: profile?.notification_preferences?.reminders ?? true,
    });

    const handleExportData = async () => {
        try {
            setIsExporting(true);
            addBreadcrumb('Exporting user data', 'settings.export', 'info');
            const { data, error } = await exportUserData(user.id);

            if (error) throw new Error(error);

            // Create blob and download
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `user_data_${user.id}_${new Date().getTime()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Data exported successfully');
        } catch (err: any) {
            toast.error(err.message || 'Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);
            addBreadcrumb('Deleting account', 'settings.delete', 'warning', { reason: deleteReason });
            const { success, error } = await requestAccountDeletion(user.id, deleteReason);

            if (error) throw new Error(error);

            toast.success('Account deletion requested');
            await signOut();
            router.push('/login');
        } catch (err: any) {
            toast.error(err.message || 'Failed to request deletion');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLogout = async () => {
        addBreadcrumb('Logging out', 'settings.logout', 'info');
        await signOut();
        router.push('/login');
    };

    const updatePreference = async (key: string, value: boolean) => {
        // Update local state immediately for responsiveness
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);

        addBreadcrumb(`Updating notification preference: ${key}`, 'settings.notifications', 'info', { value });
        const { success, error } = await updateNotificationPreferences(user.id, newPrefs);

        if (success) {
            toast.success('Preference updated');
        } else {
            // Revert on failure
            setPreferences(preferences);
            toast.error(error || 'Failed to update preference');
        }
    };

    return (
        <motion.div
            className="max-w-2xl mx-auto px-6 py-8 space-y-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            </div>

            {/* Appearance Section */}
            <motion.section variants={slideUp} className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Sun className="h-4 w-4 text-gray-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Appearance</h2>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                                <Moon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Theme Mode</p>
                                <p className="text-xs text-gray-500">Choose your preferred appearance</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-3">
                        {[
                            { id: 'light', label: 'Light', icon: Sun },
                            { id: 'dark', label: 'Dark', icon: Moon },
                            { id: 'system', label: 'System', icon: Laptop },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${theme === t.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                                    : 'border-transparent bg-gray-50 dark:bg-gray-900'
                                    }`}
                            >
                                <t.icon className={`h-5 w-5 ${theme === t.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${theme === t.id ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {t.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Notifications Section */}
            <motion.section variants={slideUp} className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Notifications</h2>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 divide-y dark:divide-gray-700">
                    {[
                        { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                        { id: 'push', label: 'Push Notifications', desc: 'Receive alerts on your device' },
                        { id: 'reminders', label: 'Appointment Reminders', desc: 'Get notified before sessions' },
                    ].map((pref) => (
                        <div key={pref.id} className="p-4 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-sm">{pref.label}</p>
                                <p className="text-xs text-gray-500">{pref.desc}</p>
                            </div>
                            <Switch
                                checked={preferences[pref.id as keyof typeof preferences]}
                                onCheckedChange={(checked) => updatePreference(pref.id, checked)}
                            />
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Privacy & Security */}
            <motion.section variants={slideUp} className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Privacy & Security</h2>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 divide-y dark:divide-gray-700">
                    <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                        <p className="font-bold text-sm">Change Password</p>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                    <div className="p-4 space-y-3">
                        <Button
                            variant="outline"
                            className="w-full rounded-2xl h-12 justify-between px-4 border-gray-200"
                            onClick={handleExportData}
                            disabled={isExporting}
                        >
                            <div className="flex items-center gap-3">
                                <Download className="h-4 w-4 text-blue-600" />
                                <span className="font-bold text-sm">Export My Data</span>
                            </div>
                            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                        </Button>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full rounded-2xl h-12 justify-between px-4 text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 dark:border-red-900/20 dark:hover:bg-red-900/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="font-bold text-sm">Delete Account</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 opacity-50" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-3xl max-w-sm">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">Delete Account?</DialogTitle>
                                    <DialogDescription className="text-sm">
                                        This action is irreversible. All your data, including appointments and messages, will be permanently removed or anonymized.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <Input
                                        label="Reason for leaving (Optional)"
                                        value={deleteReason}
                                        onChange={(e) => setDeleteReason(e.target.value)}
                                        placeholder="We'd love to know how we can improve"
                                    />
                                </div>
                                <DialogFooter className="flex-col sm:flex-col gap-2">
                                    <Button
                                        className="w-full h-12 rounded-2xl font-bold bg-red-500 hover:bg-red-600 text-white"
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Deletion'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full h-12 rounded-2xl font-bold"
                                    >
                                        Cancel
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </motion.section>

            {/* Help & Support */}
            <motion.section variants={slideUp} className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <HelpCircle className="h-4 w-4 text-gray-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Support</h2>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 divide-y dark:divide-gray-700">
                    {[
                        { id: 'support', label: 'Contact Support', icon: MessageSquare },
                        { id: 'faqs', label: 'FAQs', icon: HelpCircle },
                        { id: 'terms', label: 'Terms of Service', icon: FileText },
                        { id: 'privacy', label: 'Privacy Policy', icon: Shield },
                    ].map((item) => (
                        <button key={item.id} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <item.icon className="h-4 w-4 text-gray-400" />
                                <p className="font-bold text-sm tracking-tight">{item.label}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        </button>
                    ))}
                </div>
            </motion.section>

            {/* Logout */}
            <motion.div variants={slideUp} className="pt-4">
                <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-red-500 border-red-500/20 hover:bg-red-50 dark:hover:bg-red-900/10 gap-2"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </Button>
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400 mt-6">
                    SafeSpace Web v0.1.0 • Made with ❤️
                </p>
            </motion.div>
        </motion.div>
    );
}

function Loader2({ className }: { className?: string }) {
    return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className={className}><LogOut className="h-full w-full opacity-50" /></motion.div>
}
