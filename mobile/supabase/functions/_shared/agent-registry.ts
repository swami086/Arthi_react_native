import { bookingAgentNode } from './agents/booking-agent.ts';
import { sessionAgentNode } from './agents/session-agent.ts';
import { insightsAgentNode } from './agents/insights-agent.ts';

export const agentRegistry = {
    booking: {
        name: 'BookingAgent',
        description: 'Handles appointment booking and scheduling',
        node: bookingAgentNode,
        intents: ['book_appointment', 'check_availability', 'reschedule', 'cancel_appointment'],
    },
    session: {
        name: 'SessionAgent',
        description: 'Real-time copilot during therapy sessions',
        node: sessionAgentNode,
        intents: ['session_assistance', 'risk_assessment', 'intervention_suggestion', 'documentation'],
    },
    insights: {
        name: 'InsightsAgent',
        description: 'Analyzes patient data and provides clinical insights',
        node: insightsAgentNode,
        intents: ['analyze_progress', 'identify_patterns', 'treatment_recommendations', 'outcome_metrics'],
    },
    followup: {
        name: 'FollowupAgent',
        description: 'Handles post-session engagement and check-ins',
        node: null, // To be implemented in Wave 3
        intents: ['send_followup', 'check_homework', 'wellness_check'],
    },
};
