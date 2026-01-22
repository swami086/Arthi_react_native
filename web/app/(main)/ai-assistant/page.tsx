'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    CalendarCheck,
    BarChart3,
    MessageSquareHeart,
    Bot,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';

const AGENTS = [
    {
        id: 'booking',
        title: 'Booking Assistant',
        description: 'Schedule sessions, find specialists, and manage your appointments with ease.',
        icon: CalendarCheck,
        href: '/ai-assistant/booking',
        color: 'text-blue-600',
        borderColor: 'border-blue-200',
        bgColor: 'bg-blue-50'
    },
    {
        id: 'insights',
        title: 'Insights Dashboard',
        description: 'Visualize your progress, identify patterns, and see treatment milestones.',
        icon: BarChart3,
        href: '/ai-assistant/insights',
        color: 'text-purple-600',
        borderColor: 'border-purple-200',
        bgColor: 'bg-purple-50'
    },
    {
        id: 'followup',
        title: 'Wellness Companion',
        description: 'Post-session checks, mood tracking, and homework assistance.',
        icon: MessageSquareHeart,
        href: '/wellness-check',

        color: 'text-pink-600',
        borderColor: 'border-pink-200',
        bgColor: 'bg-pink-50'
    }
];

export default function AIAssistantPage() {
    const router = useRouter();

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-foreground-dark mb-2 flex items-center gap-3">
                    <Bot className="w-8 h-8 text-primary" />
                    AI Concierge
                </h1>
                <p className="text-foreground-muted font-medium max-w-2xl">
                    Your personal AI-powered therapy assistants, available 24/7 to support your journey.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {AGENTS.map((agent) => (
                    <Card
                        key={agent.id}
                        className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer border-2 ${agent.borderColor}`}
                        onClick={() => router.push(agent.href)}
                    >
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                            <agent.icon className="w-24 h-24" />
                        </div>

                        <CardHeader className="relative z-10">
                            <div className={`w-12 h-12 rounded-2xl ${agent.bgColor} flex items-center justify-center mb-4`}>
                                <agent.icon className={`w-6 h-6 ${agent.color}`} />
                            </div>
                            <CardTitle className="text-xl font-black">{agent.title}</CardTitle>
                            <CardDescription className="font-medium text-foreground-muted">
                                {agent.description}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="relative z-10">
                            <Button
                                variant="ghost"
                                className="group/btn p-0 h-auto font-bold text-primary hover:bg-transparent"
                            >
                                Open Assistant
                                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 border border-primary/10">
                <div className="max-w-2xl">
                    <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-primary" />
                        The Future of Care
                    </h2>
                    <p className="text-foreground-muted font-bold leading-relaxed mb-6">
                        Our AI agents are designed to work alongside your therapist, providing continuous support and insights between sessions.
                        They are HIPAA compliant and prioritize your safety and privacy above all else.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-background-light dark:bg-background-dark rounded-full shadow-sm border border-border/50">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-wider">GPT-4o Standardized</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-background-light dark:bg-background-dark rounded-full shadow-sm border border-border/50">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-xs font-black uppercase tracking-wider">HIPAA Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-background-light dark:bg-background-dark rounded-full shadow-sm border border-border/50">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <span className="text-xs font-black uppercase tracking-wider">RAG Integrated</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
