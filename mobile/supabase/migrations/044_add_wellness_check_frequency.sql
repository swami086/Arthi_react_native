-- Migration 044: Add wellness_check_frequency and enhance cost tracking
-- Add wellness_check_frequency to user_agent_preferences for proactive wellness checks
ALTER TABLE user_agent_preferences 
ADD COLUMN IF NOT EXISTS wellness_check_frequency TEXT DEFAULT 'normal' 
CHECK (wellness_check_frequency IN ('minimal', 'reduced', 'normal'));

-- Sync wellness_check_frequency with existing notification_frequency for existing users
UPDATE user_agent_preferences 
SET wellness_check_frequency = notification_frequency 
WHERE notification_frequency IS NOT NULL;

-- Increase precision for cost tracking in agent_executions (from 4 to 6 decimal places)
-- Handle view dependency
DROP VIEW IF EXISTS agent_performance_dashboard;

ALTER TABLE agent_executions 
ALTER COLUMN cost_usd TYPE DECIMAL(10, 6);

-- Recreate view
CREATE OR REPLACE VIEW agent_performance_dashboard AS
SELECT 
  agent_type,
  DATE(created_at) as date,
  COUNT(*) as executions,
  AVG(duration_ms) as avg_duration_ms,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost_usd,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failures
FROM agent_executions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY agent_type, DATE(created_at)
ORDER BY date DESC, agent_type;

COMMENT ON VIEW agent_performance_dashboard IS 'Dashboard view for tracking AI agent performance, token usage, and costs over the last 30 days.';
