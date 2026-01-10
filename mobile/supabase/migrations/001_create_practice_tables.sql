CREATE TABLE practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#4e8597',
  secondary_color VARCHAR(7) DEFAULT '#ffffff',
  accent_color VARCHAR(7) DEFAULT '#ff6b6b',
  description TEXT,
  website_url TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  subscription_tier VARCHAR(50) DEFAULT 'starter',
  subscription_status VARCHAR(50) DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_practices_owner ON practices(owner_user_id);
CREATE INDEX idx_practices_slug ON practices(slug);

CREATE TABLE practice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  allow_patient_booking BOOLEAN DEFAULT true,
  require_therapist_approval BOOLEAN DEFAULT false,
  default_session_duration_minutes INTEGER DEFAULT 50,
  cancellation_policy_text TEXT,
  terms_of_service_url TEXT,
  privacy_policy_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(practice_id)
);

CREATE INDEX idx_practice_settings_practice ON practice_settings(practice_id);

CREATE TABLE practice_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  logo_url TEXT,
  banner_image_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#4e8597',
  secondary_color VARCHAR(7) DEFAULT '#ffffff',
  accent_color VARCHAR(7) DEFAULT '#ff6b6b',
  font_family VARCHAR(100) DEFAULT 'system',
  custom_domain VARCHAR(255),
  favicon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(practice_id)
);

CREATE INDEX idx_practice_branding_practice ON practice_branding(practice_id);

CREATE TABLE practice_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invite_codes_practice ON practice_invite_codes(practice_id);
CREATE INDEX idx_invite_codes_code ON practice_invite_codes(code);
