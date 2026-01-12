-- Agent executions log for monitoring and cost tracking
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES agent_conversations(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  tool_calls JSONB DEFAULT '[]',
  tokens_used INT DEFAULT 0,
  cost_usd DECIMAL(10, 4) DEFAULT 0,
  duration_ms INT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'timeout')),
  error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_executions_conversation ON agent_executions(conversation_id);
CREATE INDEX idx_agent_executions_created ON agent_executions(created_at DESC);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);
CREATE INDEX idx_agent_executions_agent_type ON agent_executions(agent_type);

-- RLS Policies
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own executions"
  ON agent_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agent_conversations
      WHERE id = agent_executions.conversation_id
      AND user_id = auth.uid()
    )
  );
