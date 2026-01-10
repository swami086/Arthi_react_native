-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'mentee',
    approval_status TEXT DEFAULT 'pending',
    approval_date TIMESTAMPTZ,
    approved_by UUID,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mentors table
CREATE TABLE mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    specialization TEXT,
    expertise_areas TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    meeting_link TEXT,
    feedback JSONB,
    price DECIMAL(10, 2),
    payment_required BOOLEAN DEFAULT false,
    payment_status TEXT DEFAULT 'not_required',
    video_room_id UUID,
    session_type TEXT DEFAULT 'private',
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Video Rooms table
CREATE TABLE video_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    room_name TEXT,
    daily_co_url TEXT,
    google_meet_url TEXT,
    status TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- WhatsApp Messages table
CREATE TABLE whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    message_type TEXT NOT NULL,
    template_data JSONB,
    status TEXT,
    created_at TIMESTAM_TZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Relationships table
CREATE TABLE mentor_mentee_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    status TEXT NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admin Actions table
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Mentee Goals table
CREATE TABLE mentee_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    goal TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mentor Notes table
CREATE TABLE mentor_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mentee Invitations table
CREATE TABLE mentee_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
    mentee_email TEXT NOT NULL,
    invitation_message TEXT,
    invitation_token TEXT UNIQUE,
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mentee Referrals table
CREATE TABLE mentee_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referring_mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
    referred_to_mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
    referral_reason TEXT,
    referral_notes TEXT,
    status TEXT DEFAULT 'pending',
    response_notes TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
