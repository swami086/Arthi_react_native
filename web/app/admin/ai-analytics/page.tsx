'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Activity,
    BarChart3,
    Zap,
    AlertTriangle,
    Coins,
    RefreshCw,
    Bot
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { toast } from 'sonner';

export default function AIAdminDashboard() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMetrics() {
            setLoading(true);
            const supabase = createClient();

            try {
                // Fetch aggregate metrics from agent_executions
                const { data, error } = await supabase
                    .from('agent_executions')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (error) throw error;

                // Simple metric calculation
                const totalTokens = data.reduce((acc: number, m: any) => acc + (m.tokens_prompt + m.tokens_completion), 0);
                const totalCost = data.reduce((acc: number, m: any) => acc + (m.total_cost || 0), 0);
                const avgResponseTime = data.length > 0 ? data.reduce((acc: number, m: any) => acc + (m.execution_time_ms || 0), 0) / data.length : 0;
                const failureRate = data.length > 0 ? (data.filter((m: any) => m.status === 'failure').length / data.length) * 100 : 0;

                setMetrics({
                    totalRequests: data.length,
                    totalTokens,
                    totalCost,
                    avgResponseTime,
                    failureRate,
                    recentExecutions: data
                });
            } catch (err) {
                toast.error('Failed to load AI metrics');
            } finally {
                setLoading(false);
            }
        }
        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                <LoadingSkeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} className="h-32 w-full rounded-3xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 pb-24">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black mb-1 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-primary" />
                        AI Performance Dashboard
                    </h1>
                    <p className="text-foreground-muted font-medium">Monitoring clinical intelligence latency, cost, and health.</p>
                </div>
                <Button variant="outline" className="font-black gap-2" onClick={() => window.location.reload()}>
                    <RefreshCw className="w-4 h-4" />
                    Refresh Stats
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="rounded-[32px] border-2 border-border shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-foreground-muted">Total Requests</span>
                    </div>
                    <p className="text-4xl font-black">{metrics?.totalRequests}</p>
                </Card>

                <Card className="rounded-[32px] border-2 border-border shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                            <Coins className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-foreground-muted">Est. Cost</span>
                    </div>
                    <p className="text-4xl font-black">${metrics?.totalCost.toFixed(4)}</p>
                </Card>

                <Card className="rounded-[32px] border-2 border-border shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <Zap className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-foreground-muted">Avg. Latency</span>
                    </div>
                    <p className="text-4xl font-black">{metrics?.avgResponseTime.toFixed(0)}ms</p>
                </Card>

                <Card className="rounded-[32px] border-2 border-border shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-foreground-muted">Failure Rate</span>
                    </div>
                    <p className="text-4xl font-black text-red-600">{metrics?.failureRate.toFixed(1)}%</p>
                </Card>
            </div>

            {/* Recent Logs Table */}
            <Card className="rounded-[32px] border-2 border-border shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-zinc-900/50 border-b">
                    <CardTitle className="text-lg font-black italic">Recent Execution Stream</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b bg-slate-50/50 dark:bg-zinc-900/30">
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-foreground-muted">Agent</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-foreground-muted">Status</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-foreground-muted">Cost</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-foreground-muted">Latency</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-foreground-muted">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metrics?.recentExecutions.map((m: any) => (
                                <tr key={m.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="font-bold text-sm tracking-tight">{m.agent_id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${m.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-xs">${(m.total_cost || 0).toFixed(5)}</td>
                                    <td className="p-4 text-xs font-bold">{m.execution_time_ms}ms</td>
                                    <td className="p-4 text-xs text-foreground-muted">{new Date(m.created_at).toLocaleTimeString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
