-- Agent memory table for RAG
CREATE TABLE agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES agent_conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimensions
  metadata JSONB DEFAULT '{}',
  document_id UUID,
  chunk_index INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index (HNSW for better performance)
CREATE INDEX ON agent_memory USING hnsw (embedding vector_cosine_ops);

-- Other indexes
CREATE INDEX idx_agent_memory_conversation ON agent_memory(conversation_id);
CREATE INDEX idx_agent_memory_document ON agent_memory(document_id);
CREATE INDEX idx_agent_memory_created ON agent_memory(created_at DESC);

-- RLS Policies
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memory"
  ON agent_memory FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agent_conversations
      WHERE id = agent_memory.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Function for semantic search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5,
  filter JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    agent_memory.id,
    agent_memory.content,
    agent_memory.metadata,
    1 - (agent_memory.embedding <=> query_embedding) AS similarity
  FROM agent_memory
  WHERE agent_memory.metadata @> filter
  ORDER BY agent_memory.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
