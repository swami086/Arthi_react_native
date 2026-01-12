---
id: "e373c1c6-5e9b-4184-9710-57e3c7486406"
title: "Wave 4 Implementation: Frontend Web - Next.js, Vercel AI SDK, Embedded Chat & Copilot Sidebar"
assignee: ""
status: 0
createdAt: "1768117145505"
updatedAt: "1768126135551"
type: ticket
---

# Wave 4 Implementation: Frontend Web - Next.js, Vercel AI SDK, Embedded Chat & Copilot Sidebar

# Wave 4: Frontend Web Implementation

**Duration:** 2 weeks  
**Team Size:** 3-4 developers  
**Prerequisites:** Wave 1, 2, 3 complete

## Overview

Implement the web frontend with embedded AI chat interface, therapist copilot sidebar, transparency HUD, and proactive notifications using Next.js 15, Vercel AI SDK 6.0, and React 18.

## Dependencies

**Must Complete First:**
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/0e0f731a-3cf3-4dcf-830e-bf6cb48d07f7` - Wave 1 Implementation: Foundations
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/f140acd2-bd7d-40fd-b8b2-f247e357b849` - Wave 2 Implementation: Core Agents
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/64b204c2-a72c-4155-9b0d-c6adf81404c4` - Wave 3 Implementation: FollowupAgent & Backend Services

**Related Specs:**
- `spec:d969320e-d519-47a7-a258-e04789b8ce0e/b4c0579d-02d4-44b4-991b-076b73106254` - Frontend Web Implementation - Next.js & Vercel AI SDK
- `spec:d969320e-d519-47a7-a258-e04789b8ce0e/719895d0-e8a7-46cc-b5f9-829428065e26` - UX Patterns & Conversational Interface Design

**Related Tickets:**
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/ea8e94cb-d065-4fe3-ab38-99e98bb18829` - [Frontend Web] Implement Embedded Chat Interface with Vercel AI SDK
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/355ce0f3-2015-4b40-914f-ade3adb08bca` - [Frontend Web] Implement Copilot Sidebar for Therapist Sessions
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/3e2a2e4d-51f8-49c6-acef-d42d6106a66a` - [Frontend Web] Implement Transparency HUD - Agent Reasoning Display
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/66f05a02-7616-4cdb-ab80-ac2e782365a3` - [Frontend Web] Implement Proactive Notification System

---

## STEP 1: Embedded Chat Interface with Vercel AI SDK

### 1.1 Install Dependencies

```bash
cd web
pnpm add ai@latest @ai-sdk/openai@latest @ai-sdk/anthropic@latest
pnpm add @vercel/analytics @vercel/speed-insights
pnpm add sonner # For toast notifications
```

### 1.2 Create AI Chat API Route

**File:** `file:web/app/api/chat/route.ts`

```typescript
import { streamText, convertToCoreMessages } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';
import { reportError, addBreadcrumb } from '@/lib/rollbar-utils';

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, userId, intent } = await req.json();

    const supabase = await createClient();

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    addBreadcrumb('AI chat request', { userId, intent, messageCount: messages.length });

    // Call agent orchestrator
    const { data: orchestratorResponse, error: orchestratorError } = await supabase.functions.invoke(
      'agent-orchestrator',
      {
        body: {
          messages,
          userId: user.id,
          intent: intent || 'general_chat',
        },
      }
    );

    if (orchestratorError) {
      throw orchestratorError;
    }

    // Determine model based on intent
    const modelMap: Record<string, any> = {
      book_appointment: anthropic('claude-sonnet-4-5-20250929'),
      session_assistance: anthropic('claude-opus-4-5-20251101'),
      analyze_progress: openai('gpt-5.2'),
      general_chat: anthropic('claude-sonnet-4-5-20250929'),
    };

    const model = modelMap[intent] || modelMap.general_chat;

    // Stream response using Vercel AI SDK
    const result = streamText({
      model,
      messages: convertToCoreMessages(messages),
      system: orchestratorResponse.systemPrompt || 'You are a helpful AI assistant for a therapy platform.',
      temperature: 0.7,
      maxTokens: 2000,
      onFinish: async ({ text, usage }) => {
        // Log conversation to database
        await supabase.from('agent_conversations').insert({
          user_id: user.id,
          agent_type: orchestratorResponse.agentType,
          messages: [...messages, { role: 'assistant', content: text }],
          intent,
          metadata: {
            usage,
            model: model.modelId,
          },
        });

        // Track cost
        const costPerToken = model.modelId.includes('opus') ? 0.000015 : 0.000003;
        const cost = (usage.promptTokens + usage.completionTokens) * costPerToken;

        await supabase.from('agent_executions').insert({
          agent_type: orchestratorResponse.agentType,
          user_id: user.id,
          input_tokens: usage.promptTokens,
          output_tokens: usage.completionTokens,
          cost_usd: cost,
          status: 'completed',
        });
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    reportError(error, { context: 'chat-api' });
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

### 1.3 Create Chat Component

**File:** `file:web/components/ai-chat/chat-interface.tsx`

```typescript
'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  userId: string;
  intent?: string;
  placeholder?: string;
  className?: string;
}

export function ChatInterface({ userId, intent = 'general_chat', placeholder, className }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: { userId, intent },
    onError: (error) => {
      toast.error('Failed to send message. Please try again.');
      console.error('Chat error:', error);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  return (
    <div className={cn('flex flex-col h-full bg-white dark:bg-gray-900', className)}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm">Ask me anything about appointments, therapy, or your progress.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3 items-start',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
            )}

            <div
              className={cn(
                'max-w-[70%] rounded-lg px-4 py-2',
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t dark:border-gray-800 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={placeholder || 'Type your message...'}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 1.4 Create Chat Page

**File:** `file:web/app/(dashboard)/chat/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ChatInterface } from '@/components/ai-chat/chat-interface';

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-4rem)]">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg h-full">
        <div className="border-b dark:border-gray-800 p-4">
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Chat with your AI assistant for appointments, insights, and support
          </p>
        </div>
        <div className="h-[calc(100%-5rem)]">
          <ChatInterface userId={user.id} />
        </div>
      </div>
    </div>
  );
}
```

---

## STEP 2: Therapist Copilot Sidebar

### 2.1 Create Copilot Sidebar Component

**File:** `file:web/components/ai-chat/copilot-sidebar.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Brain, AlertTriangle, Lightbulb, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CopilotSidebarProps {
  sessionId: string;
  patientId: string;
  therapistId: string;
  transcript?: string;
}

export function CopilotSidebar({ sessionId, patientId, therapistId, transcript }: CopilotSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'risks' | 'notes'>('suggestions');

  const { messages, append, isLoading } = useChat({
    api: '/api/chat',
    body: {
      userId: therapistId,
      sessionId,
      patientId,
      intent: 'session_assistance',
    },
  });

  // Auto-analyze transcript when it updates
  useEffect(() => {
    if (transcript && transcript.length > 100) {
      append({
        role: 'user',
        content: `Analyze this session transcript and provide suggestions:\n\n${transcript}`,
      });
    }
  }, [transcript, append]);

  const suggestions = messages
    .filter((m) => m.role === 'assistant' && m.content.includes('suggest'))
    .map((m) => m.content);

  const risks = messages
    .filter((m) => m.role === 'assistant' && m.content.toLowerCase().includes('risk'))
    .map((m) => m.content);

  return (
    <div
      className={cn(
        'fixed right-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-l dark:border-gray-800 shadow-lg transition-all duration-300 z-40',
        isOpen ? 'w-96' : 'w-12'
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-6 top-4 w-6 h-12 bg-blue-600 text-white rounded-l-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold">AI Copilot</h2>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Real-time session assistance</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b dark:border-gray-800">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'suggestions'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <Lightbulb className="w-4 h-4 inline mr-1" />
              Suggestions
            </button>
            <button
              onClick={() => setActiveTab('risks')}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'risks'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              Risks
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === 'notes'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              Notes
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTab === 'suggestions' && (
              <>
                {isLoading && (
                  <div className="text-center text-gray-500 py-8">
                    <Brain className="w-8 h-8 animate-pulse mx-auto mb-2" />
                    <p className="text-sm">Analyzing session...</p>
                  </div>
                )}

                {suggestions.length === 0 && !isLoading && (
                  <div className="text-center text-gray-500 py-8">
                    <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No suggestions yet</p>
                    <p className="text-xs mt-1">Continue the session to receive AI insights</p>
                  </div>
                )}

                {suggestions.map((suggestion, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{suggestion}</p>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'risks' && (
              <>
                {risks.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No risks detected</p>
                  </div>
                )}

                {risks.map((risk, idx) => (
                  <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-900 dark:text-gray-100">{risk}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-2">
                <button
                  onClick={() => toast.info('SOAP note generation coming soon')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Generate SOAP Note
                </button>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  AI will generate a draft SOAP note from the session transcript
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 2.2 Create Session Page with Copilot

**File:** `file:web/app/therapist/sessions/[id]/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CopilotSidebar } from '@/components/ai-chat/copilot-sidebar';

export default async function SessionPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch session details
  const { data: session } = await supabase
    .from('appointments')
    .select('*, patient:profiles!patient_id(*)')
    .eq('id', params.id)
    .single();

  if (!session) {
    redirect('/therapist/sessions');
  }

  return (
    <div className="relative h-screen">
      {/* Main session content */}
      <div className="pr-96 h-full">
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">
            Session with {session.patient.full_name}
          </h1>
          {/* Video call, transcript, etc. */}
        </div>
      </div>

      {/* Copilot Sidebar */}
      <CopilotSidebar
        sessionId={session.id}
        patientId={session.patient_id}
        therapistId={user.id}
      />
    </div>
  );
}
```

---

## STEP 3: Transparency HUD (Agent Reasoning Display)

### 3.1 Create Transparency HUD Component

**File:** `file:web/components/ai-chat/transparency-hud.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Eye, EyeOff, Brain, Zap, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentStep {
  step: number;
  action: string;
  reasoning: string;
  tool?: string;
  result?: any;
  timestamp: string;
}

interface TransparencyHUDProps {
  agentSteps: AgentStep[];
  className?: string;
}

export function TransparencyHUD({ agentSteps, className }: TransparencyHUDProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (agentSteps.length === 0) return null;

  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        <span className="text-sm font-medium">
          {isVisible ? 'Hide' : 'Show'} AI Reasoning
        </span>
      </button>

      {/* HUD Panel */}
      {isVisible && (
        <div className="w-96 max-h-96 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border dark:border-gray-800 overflow-hidden">
          <div className="p-4 bg-purple-600 text-white">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              <h3 className="font-semibold">AI Reasoning Process</h3>
            </div>
            <p className="text-xs mt-1 opacity-90">
              See how the AI agent thinks and makes decisions
            </p>
          </div>

          <div className="overflow-y-auto max-h-80 p-4 space-y-3">
            {agentSteps.map((step) => (
              <div
                key={step.step}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700"
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-300">
                      {step.step}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {step.action}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {step.reasoning}
                    </p>
                  </div>
                </div>

                {step.tool && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <Zap className="w-3 h-3 text-yellow-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Tool: <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">{step.tool}</code>
                    </span>
                  </div>
                )}

                {step.result && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <Database className="w-3 h-3 text-green-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Result: {JSON.stringify(step.result).substring(0, 50)}...
                    </span>
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3.2 Integrate with Chat Interface

Update `file:web/components/ai-chat/chat-interface.tsx`:

```typescript
// Add to ChatInterface component
const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);

// In useChat configuration, add:
const { messages, input, handleInputChange, handleSubmit, isLoading, data } = useChat({
  api: '/api/chat',
  body: { userId, intent },
  onFinish: (message, { usage, finishReason }) => {
    // Extract agent steps from response metadata
    if (message.data?.agentSteps) {
      setAgentSteps(message.data.agentSteps);
    }
  },
});

// Add to render:
<TransparencyHUD agentSteps={agentSteps} />
```

---

## STEP 4: Proactive Notification System

### 4.1 Create Notification Component

**File:** `file:web/components/notifications/proactive-notification.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'appointment_reminder' | 'wellness_check' | 'homework_reminder' | 'agent_insight';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  read: boolean;
}

export function ProactiveNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Fetch initial notifications
    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'proactive_notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          
          // Show toast for high priority
          if (newNotification.priority === 'high') {
            toast.info(newNotification.title, {
              description: newNotification.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchNotifications() {
    const { data } = await supabase
      .from('proactive_notifications')
      .select('*')
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setNotifications(data);
    }
  }

  async function markAsRead(id: string) {
    await supabase
      .from('proactive_notifications')
      .update({ read: true })
      .eq('id', id);

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const unreadCount = notifications.length;

  const iconMap = {
    appointment_reminder: CheckCircle,
    wellness_check: Info,
    homework_reminder: AlertCircle,
    agent_insight: Bell,
  };

  const colorMap = {
    low: 'text-blue-600',
    medium: 'text-yellow-600',
    high: 'text-red-600',
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border dark:border-gray-800 z-50">
          <div className="p-4 border-b dark:border-gray-800">
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {unreadCount} unread
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = iconMap[notification.type];
                return (
                  <div
                    key={notification.id}
                    className="p-4 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={cn('w-5 h-5 mt-0.5', colorMap[notification.priority])} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 4.2 Add to Layout

**File:** `file:web/app/(dashboard)/layout.tsx`

```typescript
import { ProactiveNotifications } from '@/components/notifications/proactive-notification';

export default function DashboardLayout({ children }: { children: React.Node }) {
  return (
    <div>
      <header className="border-b dark:border-gray-800 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">TherapyFlow</h1>
          <ProactiveNotifications />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

---

## STEP 5: Testing & Deployment

### 5.1 Integration Tests

```bash
# Test chat API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "I want to book an appointment"}],
    "userId": "test-user-id",
    "intent": "book_appointment"
  }'
```

### 5.2 Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
cd web
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
```

---

## SUCCESS CRITERIA

### Embedded Chat
- ✅ Streams responses using Vercel AI SDK 6.0
- ✅ Connects to agent orchestrator successfully
- ✅ Displays messages with proper formatting
- ✅ Auto-scrolls to latest message
- ✅ Shows loading states
- ✅ Response latency < 2 seconds

### Copilot Sidebar
- ✅ Displays real-time suggestions during sessions
- ✅ Flags risk indicators prominently
- ✅ Generates SOAP note drafts
- ✅ Collapsible/expandable interface
- ✅ Updates automatically with transcript

### Transparency HUD
- ✅ Shows agent reasoning steps clearly
- ✅ Displays tool calls and results
- ✅ Toggleable visibility
- ✅ Real-time updates
- ✅ User-friendly presentation

### Proactive Notifications
- ✅ Real-time notifications via Supabase Realtime
- ✅ Toast notifications for high priority
- ✅ Mark as read functionality
- ✅ Unread count badge
- ✅ Notification history

---

## MONITORING

```typescript
// Track frontend performance
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Add to layout
<Analytics />
<SpeedInsights />
```

---

## NEXT WAVE PREVIEW

**Wave 5** will implement:
- Mobile app with React Native & Expo SDK 52/53
- GiftedChat integration for AI conversations
- Push notifications for proactive engagement
- Offline-first architecture with queue

**Estimated Duration:** 2 weeks

