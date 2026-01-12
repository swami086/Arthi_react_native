---
id: "64b204c2-a72c-4155-9b0d-c6adf81404c4"
title: "Wave 3 Implementation: FollowupAgent, WhatsApp Integration, PII Masking & Proactive Messaging"
assignee: ""
status: 0
createdAt: "1768117003278"
updatedAt: "1768126134974"
type: ticket
---

# Wave 3 Implementation: FollowupAgent, WhatsApp Integration, PII Masking & Proactive Messaging

# Wave 3: FollowupAgent & Backend Services

**Duration:** 1.5 weeks  
**Team Size:** 2-3 developers  
**Prerequisites:** Wave 1 & Wave 2 complete

## Overview

Implement the FollowupAgent for post-session engagement, enhance WhatsApp Business API integration, implement PII masking for HIPAA compliance, and set up cron jobs for proactive agent triggers.

## Dependencies

**Must Complete First:**
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/0e0f731a-3cf3-4dcf-830e-bf6cb48d07f7` - Wave 1 Implementation: Foundations
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/f140acd2-bd7d-40fd-b8b2-f247e357b849` - Wave 2 Implementation: Core Agents

**Related Specs:**
- `spec:d969320e-d519-47a7-a258-e04789b8ce0e/7dd2bb11-e4c8-4b8d-9f0b-26a8472f3353` - Agentic AI Architecture & Multi-Agent System Design
- `spec:d969320e-d519-47a7-a258-e04789b8ce0e/68139c2e-3473-476b-9d20-8a0f7891ae48` - Backend & Integration Architecture
- `spec:d969320e-d519-47a7-a258-e04789b8ce0e/51f8a991-4bf2-4282-98c1-e8d8b4e3d7ee` - HIPAA Compliance & Healthcare AI Governance

**Related Tickets:**
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/92fc4423-197a-4865-adba-7a435f624a10` - [Agent Infrastructure] Implement FollowupAgent - Post-Session Engagement
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/e26e66f8-0fe7-45aa-a662-0f6911282c26` - [Backend] Implement WhatsApp Business API Integration
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/63d72593-bee2-477a-9496-093ecdb2c0a5` - [Backend] Implement PII Masking & Data Sanitization
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/d80de8f4-f2f1-4528-9ef3-8a03c97a88d0` - [Backend] Implement Cron Jobs for Proactive Agents

---

## STEP 1: FollowupAgent Implementation

### 1.1 Create Followup Tools

**File:** `file:mobile/supabase/functions/_shared/agents/followup-tools.ts`

```typescript
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

export const followupTools = [
  {
    name: 'check_homework_completion',
    description: 'Check if patient completed assigned homework/exercises',
    parameters: z.object({
      patientId: z.string().uuid(),
      homeworkId: z.string().uuid(),
    }),
  },
  {
    name: 'send_wellness_check',
    description: 'Send a wellness check-in message to patient',
    parameters: z.object({
      patientId: z.string().uuid(),
      messageType: z.enum(['general', 'symptom_check', 'medication_reminder', 'appointment_reminder']),
      channel: z.enum(['whatsapp', 'sms', 'email', 'push']),
      scheduledFor: z.string().datetime().optional(),
    }),
  },
  {
    name: 'analyze_mood_trend',
    description: 'Analyze patient mood trends from check-ins',
    parameters: z.object({
      patientId: z.string().uuid(),
      days: z.number().min(7).max(90).default(30),
    }),
  },
  {
    name: 'escalate_to_therapist',
    description: 'Escalate concerning responses to therapist',
    parameters: z.object({
      patientId: z.string().uuid(),
      concern: z.string(),
      urgency: z.enum(['low', 'medium', 'high', 'critical']),
    }),
  },
];

export async function executeFollowupTool(
  toolName: string,
  args: any,
  supabase: any
): Promise<any> {
  switch (toolName) {
    case 'check_homework_completion':
      return await checkHomework(supabase, args);
    
    case 'send_wellness_check':
      return await sendWellnessCheck(supabase, args);
    
    case 'analyze_mood_trend':
      return await analyzeMoodTrend(supabase, args);
    
    case 'escalate_to_therapist':
      return await escalateToTherapist(supabase, args);
    
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

async function checkHomework(supabase: any, args: any) {
  const { data: homework } = await supabase
    .from('patient_homework')
    .select('*, completion_status, completed_at')
    .eq('id', args.homeworkId)
    .eq('patient_id', args.patientId)
    .single();

  return {
    homeworkId: args.homeworkId,
    patientId: args.patientId,
    completed: homework?.completion_status === 'completed',
    completedAt: homework?.completed_at,
    details: homework,
  };
}

async function sendWellnessCheck(supabase: any, args: any) {
  // Fetch patient details
  const { data: patient } = await supabase
    .from('profiles')
    .select('full_name, phone, email, preferred_language')
    .eq('id', args.patientId)
    .single();

  const messages = {
    general: `Hi ${patient.full_name}, how are you feeling today? Reply with a number 1-10 (1=very bad, 10=excellent)`,
    symptom_check: `Hi ${patient.full_name}, have you noticed any changes in your symptoms since our last session?`,
    medication_reminder: `Hi ${patient.full_name}, this is a reminder to take your prescribed medication.`,
    appointment_reminder: `Hi ${patient.full_name}, you have an upcoming appointment. Reply CONFIRM to confirm.`,
  };

  const message = messages[args.messageType];

  // Send via selected channel
  if (args.channel === 'whatsapp') {
    await supabase.functions.invoke('send-whatsapp-message', {
      body: {
        to: patient.phone,
        message,
        scheduledFor: args.scheduledFor,
      },
    });
  }

  // Store in proactive_notifications table
  const { data: notification } = await supabase
    .from('proactive_notifications')
    .insert({
      patient_id: args.patientId,
      notification_type: args.messageType,
      channel: args.channel,
      message,
      scheduled_for: args.scheduledFor || new Date().toISOString(),
      status: args.scheduledFor ? 'scheduled' : 'sent',
    })
    .select()
    .single();

  return {
    sent: true,
    notificationId: notification.id,
    channel: args.channel,
    scheduledFor: args.scheduledFor,
  };
}

async function analyzeMoodTrend(supabase: any, args: any) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - args.days);

  const { data: moodCheckins } = await supabase
    .from('mood_checkins')
    .select('mood_score, checked_in_at, notes')
    .eq('patient_id', args.patientId)
    .gte('checked_in_at', cutoffDate.toISOString())
    .order('checked_in_at', { ascending: true });

  if (!moodCheckins || moodCheckins.length === 0) {
    return {
      patientId: args.patientId,
      trend: 'insufficient_data',
      dataPoints: 0,
    };
  }

  // Calculate trend
  const avgMood = moodCheckins.reduce((sum, c) => sum + c.mood_score, 0) / moodCheckins.length;
  const recentAvg = moodCheckins.slice(-7).reduce((sum, c) => sum + c.mood_score, 0) / Math.min(7, moodCheckins.length);
  
  let trend = 'stable';
  if (recentAvg > avgMood + 1) trend = 'improving';
  if (recentAvg < avgMood - 1) trend = 'declining';

  return {
    patientId: args.patientId,
    days: args.days,
    dataPoints: moodCheckins.length,
    averageMood: avgMood.toFixed(2),
    recentAverage: recentAvg.toFixed(2),
    trend,
    moodData: moodCheckins,
  };
}

async function escalateToTherapist(supabase: any, args: any) {
  // Fetch therapist for this patient
  const { data: relationship } = await supabase
    .from('therapist_patient_relationships')
    .select('therapist_id, therapist:profiles!therapist_id(*)')
    .eq('patient_id', args.patientId)
    .eq('status', 'active')
    .single();

  if (!relationship) {
    throw new Error('No active therapist relationship found');
  }

  // Create notification for therapist
  await supabase
    .from('notifications')
    .insert({
      user_id: relationship.therapist_id,
      type: 'patient_concern',
      title: `Patient Concern - ${args.urgency.toUpperCase()}`,
      message: args.concern,
      data: {
        patientId: args.patientId,
        urgency: args.urgency,
      },
    });

  // If critical, send immediate alert
  if (args.urgency === 'critical') {
    await supabase.functions.invoke('send-whatsapp-message', {
      body: {
        to: relationship.therapist.phone,
        message: `URGENT: Patient concern requires immediate attention. ${args.concern}`,
      },
    });
  }

  return {
    escalated: true,
    therapistId: relationship.therapist_id,
    urgency: args.urgency,
  };
}
```

### 1.2 Create FollowupAgent Node

**File:** `file:mobile/supabase/functions/_shared/agents/followup-agent.ts`

```typescript
import { LLMClient } from '../llm-client.ts';
import { followupTools, executeFollowupTool } from './followup-tools.ts';

export interface FollowupAgentState {
  messages: any[];
  userId: string;
  patientId: string;
  intent: string;
  toolCalls: any[];
  result: any;
  escalations: any[];
}

export async function followupAgentNode(
  state: FollowupAgentState,
  supabase: any,
  llmClient: LLMClient
): Promise<Partial<FollowupAgentState>> {
  const systemPrompt = `You are a compassionate AI followup assistant for a therapy platform.
Your role is to check in with patients between sessions, monitor their wellbeing, and escalate concerns.

IMPORTANT GUIDELINES:
1. Be warm, empathetic, and supportive
2. Check homework completion and encourage progress
3. Monitor mood trends and flag concerning patterns
4. Escalate immediately if patient expresses:
   - Suicidal ideation
   - Self-harm thoughts
   - Severe symptom worsening
   - Medication non-compliance
5. Respect patient preferences for communication frequency
6. Maintain HIPAA compliance in all communications

Available tools:
- check_homework_completion: Check if homework was completed
- send_wellness_check: Send check-in messages
- analyze_mood_trend: Analyze mood patterns
- escalate_to_therapist: Escalate concerns to therapist

Current patient ID: ${state.patientId}`;

  const response = await llmClient.chat({
    model: 'claude-sonnet-4-5-20250929', // Claude Sonnet 4.5 for empathetic communication
    messages: [
      { role: 'system', content: systemPrompt },
      ...state.messages,
    ],
    tools: followupTools,
    temperature: 0.7, // Higher temperature for more natural, empathetic responses
  });

  // Execute tool calls
  const toolResults = [];
  const escalations = [];

  if (response.toolCalls && response.toolCalls.length > 0) {
    for (const toolCall of response.toolCalls) {
      const result = await executeFollowupTool(
        toolCall.name,
        toolCall.arguments,
        supabase
      );
      toolResults.push({ toolCall, result });

      // Track escalations
      if (toolCall.name === 'escalate_to_therapist') {
        escalations.push(result);
      }
    }
  }

  return {
    messages: [...state.messages, response.message],
    toolCalls: toolResults,
    result: response.content,
    escalations: [...(state.escalations || []), ...escalations],
  };
}
```

---

## STEP 2: Enhanced WhatsApp Business API Integration

### 2.1 Update WhatsApp Service

**File:** `file:mobile/supabase/functions/send-whatsapp-message/index.ts`

Enhance the existing WhatsApp function with scheduling and templates:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { reportError } from '../_shared/rollbar.ts';

interface WhatsAppMessage {
  to: string;
  message?: string;
  templateName?: string;
  templateParams?: Record<string, string>;
  scheduledFor?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, message, templateName, templateParams, scheduledFor }: WhatsAppMessage = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // If scheduled, store for later processing
    if (scheduledFor) {
      const { data, error } = await supabase
        .from('scheduled_messages')
        .insert({
          to,
          message,
          template_name: templateName,
          template_params: templateParams,
          scheduled_for: scheduledFor,
          channel: 'whatsapp',
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, scheduled: true, messageId: data.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send immediately via Twilio
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')!;
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER')!;

    let body: any;

    if (templateName) {
      // Use WhatsApp template
      body = {
        From: `whatsapp:${twilioWhatsAppNumber}`,
        To: `whatsapp:${to}`,
        ContentSid: templateName,
        ContentVariables: JSON.stringify(templateParams || {}),
      };
    } else {
      // Send plain message
      body = {
        From: `whatsapp:${twilioWhatsAppNumber}`,
        To: `whatsapp:${to}`,
        Body: message,
      };
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(body).toString(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twilio API error: ${error}`);
    }

    const result = await response.json();

    // Log message in database
    await supabase
      .from('whatsapp_messages')
      .insert({
        to,
        message,
        template_name: templateName,
        twilio_sid: result.sid,
        status: result.status,
        sent_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({ success: true, messageSid: result.sid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    reportError(error, { context: 'send-whatsapp-message' });
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## STEP 3: PII Masking & Data Sanitization

### 3.1 Create PII Masking Service

**File:** `file:mobile/supabase/functions/_shared/pii-masking.ts`

```typescript
export interface PIIMaskingConfig {
  maskNames: boolean;
  maskPhones: boolean;
  maskEmails: boolean;
  maskAddresses: boolean;
  maskSSN: boolean;
  maskDates: boolean;
}

export class PIIMaskingService {
  private config: PIIMaskingConfig;

  constructor(config: Partial<PIIMaskingConfig> = {}) {
    this.config = {
      maskNames: true,
      maskPhones: true,
      maskEmails: true,
      maskAddresses: true,
      maskSSN: true,
      maskDates: true,
      ...config,
    };
  }

  maskText(text: string): string {
    let masked = text;

    if (this.config.maskNames) {
      // Mask names (simple heuristic: capitalized words)
      masked = masked.replace(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g, '[NAME]');
    }

    if (this.config.maskPhones) {
      // Mask phone numbers
      masked = masked.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
      masked = masked.replace(/\b\+\d{1,3}\s?\d{10}\b/g, '[PHONE]');
    }

    if (this.config.maskEmails) {
      // Mask emails
      masked = masked.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
    }

    if (this.config.maskAddresses) {
      // Mask addresses (simple heuristic: number + street)
      masked = masked.replace(/\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)\b/gi, '[ADDRESS]');
    }

    if (this.config.maskSSN) {
      // Mask SSN
      masked = masked.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
    }

    if (this.config.maskDates) {
      // Mask dates (MM/DD/YYYY, MM-DD-YYYY)
      masked = masked.replace(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, '[DATE]');
    }

    return masked;
  }

  async maskConversation(
    supabase: any,
    conversationId: string
  ): Promise<{ original: string; masked: string }> {
    // Fetch conversation
    const { data: conversation } = await supabase
      .from('agent_conversations')
      .select('messages')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const original = JSON.stringify(conversation.messages);
    const masked = this.maskText(original);

    return { original, masked };
  }

  async sanitizeForLogging(data: any): Promise<any> {
    // Recursively sanitize object
    if (typeof data === 'string') {
      return this.maskText(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeForLogging(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Skip sensitive fields entirely
        if (['password', 'ssn', 'credit_card'].includes(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeForLogging(value);
        }
      }
      return sanitized;
    }

    return data;
  }
}
```

### 3.2 Create PII Masking Edge Function

**File:** `file:mobile/supabase/functions/mask-pii/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { PIIMaskingService } from '../_shared/pii-masking.ts';
import { reportError } from '../_shared/rollbar.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, conversationId, config } = await req.json();

    const maskingService = new PIIMaskingService(config);

    let result;

    if (conversationId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      result = await maskingService.maskConversation(supabase, conversationId);
    } else if (text) {
      result = {
        original: text,
        masked: maskingService.maskText(text),
      };
    } else {
      throw new Error('Either text or conversationId must be provided');
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    reportError(error, { context: 'mask-pii' });
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## STEP 4: Cron Jobs for Proactive Agents

### 4.1 Create Cron Job Handler

**File:** `file:mobile/supabase/functions/proactive-agent-cron/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { reportError, reportInfo } from '../_shared/rollbar.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const now = new Date().toISOString();

    // 1. Process scheduled messages
    const { data: scheduledMessages } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .limit(100);

    for (const msg of scheduledMessages || []) {
      try {
        await supabase.functions.invoke('send-whatsapp-message', {
          body: {
            to: msg.to,
            message: msg.message,
            templateName: msg.template_name,
            templateParams: msg.template_params,
          },
        });

        await supabase
          .from('scheduled_messages')
          .update({ status: 'sent', sent_at: now })
          .eq('id', msg.id);
      } catch (error) {
        reportError(error, { context: 'scheduled-message', messageId: msg.id });
        await supabase
          .from('scheduled_messages')
          .update({ status: 'failed', error: error.message })
          .eq('id', msg.id);
      }
    }

    // 2. Trigger daily wellness checks
    const { data: patients } = await supabase
      .from('user_agent_preferences')
      .select('user_id, wellness_check_frequency, last_wellness_check')
      .eq('wellness_checks_enabled', true);

    for (const patient of patients || []) {
      const lastCheck = patient.last_wellness_check ? new Date(patient.last_wellness_check) : null;
      const daysSinceCheck = lastCheck ? (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60 * 24) : 999;

      if (daysSinceCheck >= patient.wellness_check_frequency) {
        // Trigger FollowupAgent
        await supabase.functions.invoke('agent-orchestrator', {
          body: {
            message: 'Send daily wellness check',
            userId: patient.user_id,
            patientId: patient.user_id,
            intent: 'send_wellness_check',
            automated: true,
          },
        });

        await supabase
          .from('user_agent_preferences')
          .update({ last_wellness_check: now })
          .eq('user_id', patient.user_id);
      }
    }

    // 3. Check for overdue homework
    const { data: overdueHomework } = await supabase
      .from('patient_homework')
      .select('*, patient:profiles!patient_id(*)')
      .eq('completion_status', 'pending')
      .lt('due_date', now);

    for (const homework of overdueHomework || []) {
      await supabase.functions.invoke('agent-orchestrator', {
        body: {
          message: `Homework reminder: ${homework.title}`,
          userId: homework.patient_id,
          patientId: homework.patient_id,
          intent: 'homework_reminder',
          automated: true,
        },
      });
    }

    reportInfo('Proactive agent cron completed', {
      scheduledMessagesSent: scheduledMessages?.length || 0,
      wellnessChecksTriggered: patients?.length || 0,
      homeworkReminders: overdueHomework?.length || 0,
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed: {
          scheduledMessages: scheduledMessages?.length || 0,
          wellnessChecks: patients?.length || 0,
          homeworkReminders: overdueHomework?.length || 0,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    reportError(error, { context: 'proactive-agent-cron' });
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 4.2 Configure Supabase Cron

Add to `file:mobile/supabase/config.toml`:

```toml
[functions.proactive-agent-cron]
verify_jwt = false

[[functions.proactive-agent-cron.cron]]
schedule = "*/15 * * * *"  # Every 15 minutes
```

---

## STEP 5: Update Agent Registry

**File:** `file:mobile/supabase/functions/_shared/agent-registry.ts`

```typescript
import { followupAgentNode } from './agents/followup-agent.ts';

// Add to existing registry
export const agentRegistry = {
  // ... existing agents (booking, session, insights)
  followup: {
    name: 'FollowupAgent',
    description: 'Handles post-session engagement and check-ins',
    node: followupAgentNode,
    intents: ['send_followup', 'check_homework', 'wellness_check', 'mood_tracking'],
  },
};
```

---

## STEP 6: Integration Testing

### 6.1 Test FollowupAgent

```bash
# Test wellness check
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/agent-orchestrator \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Send a wellness check to the patient",
    "userId": "test-therapist-id",
    "patientId": "test-patient-id",
    "intent": "wellness_check"
  }'
```

### 6.2 Test WhatsApp Scheduling

```bash
# Test scheduled message
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/send-whatsapp-message \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "This is a scheduled wellness check",
    "scheduledFor": "2026-01-15T10:00:00Z"
  }'
```

### 6.3 Test PII Masking

```bash
# Test PII masking
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/mask-pii \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Patient John Doe called from 555-123-4567 about his appointment at 123 Main Street.",
    "config": {
      "maskNames": true,
      "maskPhones": true,
      "maskAddresses": true
    }
  }'
```

### 6.4 Test Cron Job

```bash
# Manually trigger cron
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/proactive-agent-cron \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

---

## SUCCESS CRITERIA

### FollowupAgent
- ✅ Sends wellness checks successfully
- ✅ Checks homework completion accurately
- ✅ Analyzes mood trends correctly
- ✅ Escalates concerns to therapist appropriately
- ✅ Response time < 3 seconds

### WhatsApp Integration
- ✅ Sends immediate messages via Twilio
- ✅ Schedules messages for future delivery
- ✅ Supports WhatsApp templates
- ✅ Logs all messages in database
- ✅ Delivery rate > 95%

### PII Masking
- ✅ Masks names, phones, emails, addresses correctly
- ✅ Sanitizes data for logging
- ✅ Preserves conversation context while masking PII
- ✅ Performance < 100ms for typical text

### Cron Jobs
- ✅ Processes scheduled messages every 15 minutes
- ✅ Triggers wellness checks based on user preferences
- ✅ Sends homework reminders for overdue tasks
- ✅ Handles errors gracefully without stopping execution
- ✅ Logs all cron activities to Rollbar

---

## MONITORING & COST TRACKING

### Rollbar Tracking

```typescript
// Track FollowupAgent performance
reportInfo('FollowupAgent execution', {
  patientId: state.patientId,
  intent: state.intent,
  toolCallsCount: toolResults.length,
  escalationsCount: escalations.length,
  duration: executionTime,
});

// Track WhatsApp delivery
reportInfo('WhatsApp message sent', {
  to: to,
  channel: 'whatsapp',
  scheduled: !!scheduledFor,
  twilioSid: result.sid,
});

// Track PII masking
reportInfo('PII masking completed', {
  originalLength: original.length,
  maskedLength: masked.length,
  maskingRatio: (masked.length / original.length).toFixed(2),
});
```

### Cost Queries

```sql
-- FollowupAgent execution costs
SELECT 
  DATE(created_at) as date,
  COUNT(*) as executions,
  SUM(cost_usd) as total_cost
FROM agent_executions
WHERE agent_type = 'followup'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- WhatsApp message costs (Twilio pricing: $0.005 per message)
SELECT 
  DATE(sent_at) as date,
  COUNT(*) as messages_sent,
  COUNT(*) * 0.005 as estimated_cost_usd
FROM whatsapp_messages
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(sent_at)
ORDER BY date DESC;
```

---

## NEXT WAVE PREVIEW

**Wave 4** will implement:
- Frontend Web: Embedded chat interface with Vercel AI SDK
- Copilot sidebar for therapist sessions
- Transparency HUD showing agent reasoning
- Proactive notification system

**Estimated Duration:** 2 weeks

