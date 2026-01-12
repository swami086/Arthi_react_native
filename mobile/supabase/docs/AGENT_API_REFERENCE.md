# Agent Orchestrator API Reference

## Endpoint
`POST /functions/v1/agent-orchestrator`

## Request Body
```json
{
  "message": "string (required)",
  "context": {
    "userId": "uuid (required)",
    "patientId": "uuid (optional)",
    "therapistId": "uuid (optional)",
    "sessionId": "uuid (optional)"
  },
  "conversationId": "uuid (optional)"
}
```

## Response Body
```json
{
  "conversationId": "uuid",
  "agentType": "booking|session|insights|followup|general",
  "response": "string",
  "toolCalls": [
    {
      "name": "string",
      "arguments": {}
    }
  ],
  "confidence": 85,
  "reasoning": ["string"],
  "usage": {
    "totalTokens": 1234
  },
  "cost": 0.0123
}
```

## Error Responses
- **400 Bad Request**: Invalid inputs or missing required fields.
- **500 Internal Server Error**: Unexpected errors in intent classification or agent execution.

## Authentication
Requires standard Supabase Authorization header: `Bearer $SUPABASE_ANON_KEY`.
