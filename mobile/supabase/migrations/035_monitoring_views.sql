-- Agent performance dashboard view for costs and performance monitoring
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
