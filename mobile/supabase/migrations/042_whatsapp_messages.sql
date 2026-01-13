-- WhatsApp Messages Table
CREATE TABLE whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "to" TEXT NOT NULL,
  message TEXT NOT NULL,
  template_name TEXT,
  twilio_sid TEXT UNIQUE,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'undelivered')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_whatsapp_messages_to ON whatsapp_messages("to");
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_twilio_sid ON whatsapp_messages(twilio_sid);
CREATE INDEX idx_whatsapp_messages_sent_at ON whatsapp_messages(sent_at DESC);
CREATE INDEX idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);

-- RLS Policies
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all WhatsApp messages"
  ON whatsapp_messages FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
