-- Agent tools registry
CREATE TABLE agent_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  parameters JSONB NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  rate_limit JSONB DEFAULT '{"calls": 100, "window": "1h"}',
  enabled BOOLEAN DEFAULT true,
  version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_tools_name ON agent_tools(name);
CREATE INDEX idx_agent_tools_enabled ON agent_tools(enabled);

-- Seed initial tools
INSERT INTO agent_tools (name, description, parameters, permissions) VALUES
('search_therapists', 'Search for therapists by specialty and location', 
 '{"type": "object", "properties": {"specialty": {"type": "string"}, "location": {"type": "string"}}}',
 ARRAY['patient', 'therapist']),
('get_availability', 'Get therapist availability for booking',
 '{"type": "object", "properties": {"therapist_id": {"type": "string"}, "date_range": {"type": "string"}}}',
 ARRAY['patient', 'therapist']),
('book_appointment', 'Book an appointment with a therapist',
 '{"type": "object", "properties": {"therapist_id": {"type": "string"}, "patient_id": {"type": "string"}, "slot": {"type": "string"}}}',
 ARRAY['patient']);
