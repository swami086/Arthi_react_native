/**
 * A2UI Copilot Sidebar Component
 * 
 * Displays AI-generated interventions, risk alerts, and patterns during a therapy session.
 */

'use client';

import React from 'react';
import { useSessionCopilot } from '@/hooks/use-session-copilot';
import { A2UIRenderer } from '@/lib/a2ui/renderer';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Zap, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface A2UICopilotSidebarProps {
    appointmentId: string;
    transcriptId?: string;
    userId: string;
    className?: string;
}

export function A2UICopilotSidebar({
    appointmentId,
    transcriptId,
    userId,
    className
}: A2UICopilotSidebarProps) {
    const {
        surface,
        loading,
        isAnalyzing,
        refreshAnalysis,
        connected,
        sendAction,
        error,
        retry
    } = useSessionCopilot({ userId, appointmentId, transcriptId });

    return (
        <div className={cn(
            "flex flex-col h-full bg-background border-l w-[350px] shrink-0",
            className
        )}>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <h2 className="font-semibold text-sm">AI Copilot</h2>
                    <Badge variant={connected ? "success" : "secondary"} className="text-[10px] px-1.5 h-4">
                        {connected ? 'LIVE' : 'IDLE'}
                    </Badge>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={refreshAnalysis}
                    disabled={isAnalyzing || !transcriptId}
                    className="h-8 w-8"
                >
                    <RefreshCw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                    {error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/10 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="space-y-1 px-4">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Connection Failed</p>
                                <p className="text-xs text-muted-foreground">{error}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={retry} className="h-8">
                                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                Try Again
                            </Button>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p className="text-sm font-medium">Initializing Copilot...</p>
                        </div>
                    ) : !transcriptId ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <Activity className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm font-medium">No Live Transcript</p>
                            <p className="text-xs px-6 mt-1">
                                Start recording to enable real-time AI interventions and risk alerts.
                            </p>
                        </div>
                    ) : !surface || surface.components.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <Zap className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm font-medium">Analyzing Session...</p>
                            <p className="text-xs px-6 mt-1">
                                We're listening for therapeutic opportunities. Suggestions will appear here soon.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshAnalysis}
                                className="mt-4"
                            >
                                Force Refresh
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <A2UIRenderer
                                surface={surface}
                                onAction={(action) => sendAction({
                                    ...action,
                                    surfaceId: surface.surfaceId
                                })}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Status */}
            <div className="p-3 border-t bg-muted/10">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        connected ? "bg-green-500" : "bg-gray-400"
                    )} />
                    <span>
                        {connected ? 'Real-time analysis active' : 'Waiting for connection...'}
                    </span>
                    {surface?.updatedAt && (
                        <span className="ml-auto">
                            Updated {new Date(surface.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
