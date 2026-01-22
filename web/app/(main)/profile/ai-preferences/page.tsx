'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { preferencesService, UserAgentPreferences } from '@/lib/services/preferences-service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Save, Bot, ShieldCheck, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function AIPreferencesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [prefs, setPrefs] = useState<UserAgentPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadPrefs() {
            if (!user) return;
            try {
                const data = await preferencesService.getUserPreferences(user.id);
                setPrefs(data || {
                    userId: user.id,
                    enabledAgents: ['booking-agent', 'insights-agent'],
                    notificationFrequency: 'normal',
                    dataSharingConsent: true,
                    transparencyLevel: 'simple',
                    languagePreference: 'en'
                });
            } catch (err) {
                toast.error('Failed to load preferences');
            } finally {
                setLoading(false);
            }
        }
        loadPrefs();
    }, [user]);

    const handleSave = async () => {
        if (!user || !prefs) return;
        setSaving(true);
        try {
            await preferencesService.updatePreferences(user.id, prefs);
            toast.success('Preferences saved successfully');
        } catch (err) {
            toast.error('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    const toggleAgent = (agentId: string) => {
        if (!prefs) return;
        const newAgents = prefs.enabledAgents.includes(agentId)
            ? prefs.enabledAgents.filter(id => id !== agentId)
            : [...prefs.enabledAgents, agentId];
        setPrefs({ ...prefs, enabledAgents: newAgents });
    };

    if (loading) {
        return (
            <div className="p-8 max-w-4xl mx-auto space-y-6">
                <LoadingSkeleton className="h-10 w-48" />
                <LoadingSkeleton className="h-64 w-full rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 pb-32">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black mb-1">AI Preferences</h1>
                        <p className="text-foreground-muted font-medium">Customize how your AI assistants interact with you.</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="font-black gap-2">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Agent Activation */}
                <Card className="rounded-[32px] overflow-hidden border-2 border-border shadow-sm">
                    <CardHeader className="bg-slate-50 dark:bg-zinc-900/50 border-b">
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            <Bot className="w-5 h-5 text-primary" />
                            Enabled Assistants
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {[
                            { id: 'booking-agent', label: 'Booking Assistant', desc: 'Schedules and manages appointments' },
                            { id: 'insights-agent', label: 'Insights Dashboard', desc: 'Analyzes progress and patterns' },
                            { id: 'followup-agent', label: 'Wellness Companion', desc: 'Daily follow-ups and mood tracking' }
                        ].map((agent) => (
                            <div key={agent.id} className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-border hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-all">
                                <div>
                                    <p className="font-black">{agent.label}</p>
                                    <p className="text-xs text-foreground-muted font-medium">{agent.desc}</p>
                                </div>
                                <Switch
                                    checked={prefs?.enabledAgents.includes(agent.id)}
                                    onCheckedChange={() => toggleAgent(agent.id)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Notifications & Privacy */}
                <Card className="rounded-[32px] overflow-hidden border-2 border-border shadow-sm">
                    <CardHeader className="bg-slate-50 dark:bg-zinc-900/50 border-b">
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-500" />
                            Notifications & Privacy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        <div className="space-y-4">
                            <label className="text-sm font-black uppercase tracking-widest text-foreground-muted">Frequency</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['minimal', 'reduced', 'normal', 'proactive'].map((freq) => (
                                    <button
                                        key={freq}
                                        className={`p-3 rounded-xl border-2 font-black text-xs transition-all ${prefs?.notificationFrequency === freq ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground-muted bg-transparent'}`}
                                        onClick={() => setPrefs(p => p ? { ...p, notificationFrequency: freq as any } : null)}
                                    >
                                        {freq.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-zinc-900/50 rounded-3xl border border-primary/20">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-black text-lg">AI Training Consent</p>
                                    <p className="text-sm text-foreground-muted font-medium max-w-md">Allow anonymized data to improve the AI's clinical accuracy. Your PII is never shared.</p>
                                </div>
                            </div>
                            <Switch
                                checked={prefs?.dataSharingConsent}
                                onCheckedChange={(val) => setPrefs(p => p ? { ...p, dataSharingConsent: val } : null)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
