-- Add missing columns to agent_memory table for RAG system
-- These columns are required by embedding-service.ts and search_agent_memory function

-- Add user_id column (references auth.users)
ALTER TABLE agent_memory 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add memory_type column with constraint
ALTER TABLE agent_memory 
ADD COLUMN memory_type TEXT 
CHECK (memory_type IN ('session_note', 'patient_goal', 'therapist_note', 'conversation', 'assessment'));

-- Backfill user_id from agent_conversations for existing records
UPDATE agent_memory am
SET user_id = ac.user_id
FROM agent_conversations ac
WHERE am.conversation_id = ac.id
AND am.user_id IS NULL;

-- Add indexes for performance
CREATE INDEX idx_agent_memory_user_id ON agent_memory(user_id);
CREATE INDEX idx_agent_memory_memory_type ON agent_memory(memory_type);
CREATE INDEX idx_agent_memory_user_type ON agent_memory(user_id, memory_type);

-- Update RLS policy to use user_id directly (faster than JOIN)
DROP POLICY IF EXISTS "Users can view own memory" ON agent_memory;

CREATE POLICY "Users can view own memory"
  ON agent_memory FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own memory"
  ON agent_memory FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own memory"
  ON agent_memory FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own memory"
  ON agent_memory FOR DELETE
  USING (user_id = auth.uid());

-- Add comment
COMMENT ON COLUMN agent_memory.user_id IS 'Direct user reference for fast filtering without JOINs';
COMMENT ON COLUMN agent_memory.memory_type IS 'Type of memory: session_note, patient_goal, therapist_note, conversation, assessment';
