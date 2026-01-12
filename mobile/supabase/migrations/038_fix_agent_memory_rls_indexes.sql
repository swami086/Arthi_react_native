-- Fix agent_memory indexes and RLS policies
-- This ensures strict compliance with the RAG system requirements

-- 1. Add missing single-column indexes (composite index already exists)
CREATE INDEX IF NOT EXISTS idx_agent_memory_user_id ON agent_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_memory_type ON agent_memory(memory_type);

-- 2. Clean up old/mixed RLS policies
DROP POLICY IF EXISTS "Users can view and manage own memory" ON agent_memory;
DROP POLICY IF EXISTS "Users can view own memory" ON agent_memory;
DROP POLICY IF EXISTS "Users can insert own memory" ON agent_memory;
DROP POLICY IF EXISTS "Users can update own memory" ON agent_memory;
DROP POLICY IF EXISTS "Users can delete own memory" ON agent_memory;

-- 3. Re-create strict, performant RLS policies using direct user_id check
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
