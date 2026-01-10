export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    message: string
                    type: 'appointment' | 'message' | 'system' | 'payment'
                    is_read: boolean
                    created_at: string
                    related_entity_id: string | null
                    metadata: Json | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    message: string
                    type: 'appointment' | 'message' | 'system' | 'payment'
                    is_read?: boolean
                    created_at?: string
                    related_entity_id?: string | null
                    metadata?: Json | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    message?: string
                    type?: 'appointment' | 'message' | 'system' | 'payment'
                    is_read?: boolean
                    created_at?: string
                    related_entity_id?: string | null
                    metadata?: Json | null
                }
            }

            session_recordings: {
                Row: {
                    id: string
                    appointment_id: string
                    therapist_id: string
                    patient_id: string
                    recording_url: string
                    recording_status: 'processing' | 'completed' | 'failed'
                    consent_captured: boolean
                    file_size_bytes: number
                    duration_seconds: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    appointment_id: string
                    therapist_id: string
                    patient_id: string
                    recording_url: string
                    recording_status?: 'processing' | 'completed' | 'failed'
                    consent_captured?: boolean
                    file_size_bytes: number
                    duration_seconds?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    appointment_id?: string
                    therapist_id?: string
                    patient_id?: string
                    recording_url?: string
                    recording_status?: 'processing' | 'completed' | 'failed'
                    consent_captured?: boolean
                    file_size_bytes?: number
                    duration_seconds?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }

            transcripts: {
                Row: {
                    id: string
                    recording_id: string
                    transcript_text: string
                    language_detected: string
                    word_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    recording_id: string
                    transcript_text: string
                    language_detected: string
                    word_count: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    recording_id?: string
                    transcript_text?: string
                    language_detected?: string
                    word_count?: number
                    created_at?: string
                }
            }

            soap_notes: {
                Row: {
                    id: string
                    appointment_id: string
                    transcript_id: string
                    subjective: string
                    objective: string
                    assessment: string
                    plan: string
                    is_finalized: boolean
                    edited_by_therapist: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    appointment_id: string
                    transcript_id: string
                    subjective?: string
                    objective?: string
                    assessment?: string
                    plan?: string
                    is_finalized?: boolean
                    edited_by_therapist?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    appointment_id?: string
                    transcript_id?: string
                    subjective?: string
                    objective?: string
                    assessment?: string
                    plan?: string
                    is_finalized?: boolean
                    edited_by_therapist?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }

            profiles: {
                Row: {
                    user_id: string
                    role: 'therapist' | 'patient' | 'admin'
                    full_name: string | null
                    bio: string | null
                    avatar_url: string | null
                    expertise_areas: string[] | null
                    phone_number: string | null
                    years_of_experience: number | null
                    specialization: string | null
                    is_available: boolean
                    rating_average: number
                    total_sessions: number
                    created_at: string
                    approval_status: 'pending' | 'approved' | 'rejected' | null
                    approval_date: string | null
                    approved_by: string | null
                    background_check_status: 'pending' | 'completed' | 'failed' | null
                    verification_documents: string[] | null
                    rejection_reason: string | null
                    therapist_bio_extended: string | null
                    certifications: string[] | null
                    is_super_admin: boolean
                    hourly_rate: number | null
                    practice_id: string | null
                    practice_role: string | null
                }
                Insert: {
                    user_id: string
                    role: 'therapist' | 'patient' | 'admin'
                    full_name?: string | null
                    bio?: string | null
                    avatar_url?: string | null
                    expertise_areas?: string[] | null
                    phone_number?: string | null
                    years_of_experience?: number | null
                    specialization?: string | null
                    is_available?: boolean
                    rating_average?: number
                    total_sessions?: number
                    created_at?: string
                    approval_status?: 'pending' | 'approved' | 'rejected' | null
                    approval_date?: string | null
                    approved_by?: string | null
                    background_check_status?: 'pending' | 'completed' | 'failed' | null
                    verification_documents?: string[] | null
                    rejection_reason?: string | null
                    therapist_bio_extended?: string | null
                    certifications?: string[] | null
                    is_super_admin?: boolean
                    hourly_rate?: number | null
                }
                Update: {
                    user_id?: string
                    role?: 'therapist' | 'patient' | 'admin'
                    full_name?: string | null
                    bio?: string | null
                    avatar_url?: string | null
                    expertise_areas?: string[] | null
                    phone_number?: string | null
                    years_of_experience?: number | null
                    specialization?: string | null
                    is_available?: boolean
                    rating_average?: number
                    total_sessions?: number
                    created_at?: string
                    approval_status?: 'pending' | 'approved' | 'rejected' | null
                    approval_date?: string | null
                    approved_by?: string | null
                    background_check_status?: 'pending' | 'completed' | 'failed' | null
                    verification_documents?: string[] | null
                    rejection_reason?: string | null
                    therapist_bio_extended?: string | null
                    certifications?: string[] | null
                    is_super_admin?: boolean
                    hourly_rate?: number | null
                }
            }
            therapist_patient_relationships: {
                Row: {
                    id: string
                    therapist_id: string
                    patient_id: string
                    status: 'active' | 'inactive' | 'pending' | 'completed' | 'declined'
                    assigned_date: string
                    assigned_by: string | null
                    end_date: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    therapist_id: string
                    patient_id: string
                    status?: 'active' | 'inactive' | 'pending' | 'completed' | 'declined'
                    assigned_date?: string
                    assigned_by?: string | null
                    end_date?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    therapist_id?: string
                    patient_id?: string
                    status?: 'active' | 'inactive' | 'pending' | 'completed' | 'declined'
                    assigned_date?: string
                    assigned_by?: string | null
                    end_date?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            patient_referrals: {
                Row: {
                    id: string
                    patient_id: string
                    referring_therapist_id: string
                    referred_to_therapist_id: string
                    status: 'pending' | 'accepted' | 'declined' | 'completed'
                    referral_reason: string
                    referral_notes: string | null
                    response_notes: string | null
                    created_at: string
                    responded_at: string | null
                }
                Insert: {
                    id?: string
                    patient_id: string
                    referring_therapist_id: string
                    referred_to_therapist_id: string
                    status?: 'pending' | 'accepted' | 'declined' | 'completed'
                    referral_reason: string
                    referral_notes?: string | null
                    response_notes?: string | null
                    created_at?: string
                    responded_at?: string | null
                }
                Update: {
                    id?: string
                    patient_id?: string
                    referring_therapist_id?: string
                    referred_to_therapist_id?: string
                    status?: 'pending' | 'accepted' | 'declined' | 'completed'
                    referral_reason?: string
                    referral_notes?: string | null
                    response_notes?: string | null
                    created_at?: string
                    responded_at?: string | null
                }
            }
            patient_invitations: {
                Row: {
                    id: string
                    therapist_id: string
                    patient_email: string
                    patient_name: string | null
                    invitation_message: string | null
                    status: 'pending' | 'accepted' | 'expired'
                    invitation_token: string
                    expires_at: string
                    created_at: string
                    accepted_at: string | null
                }
                Insert: {
                    id?: string
                    therapist_id: string
                    patient_email: string
                    patient_name?: string | null
                    invitation_message?: string | null
                    status?: 'pending' | 'accepted' | 'expired'
                    invitation_token: string
                    expires_at: string
                    created_at?: string
                    accepted_at?: string | null
                }
                Update: {
                    id?: string
                    therapist_id?: string
                    patient_email?: string
                    patient_name?: string | null
                    invitation_message?: string | null
                    status?: 'pending' | 'accepted' | 'expired'
                    invitation_token?: string
                    expires_at?: string
                    created_at?: string
                    accepted_at?: string | null
                }
            }
            admin_actions: {
                Row: {
                    id: string
                    admin_id: string
                    action_type: 'create_admin' | 'approve_therapist' | 'reject_therapist' | 'assign_patient'
                    target_user_id: string | null
                    details: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    admin_id: string
                    action_type: 'create_admin' | 'approve_therapist' | 'reject_therapist' | 'assign_patient'
                    target_user_id?: string | null
                    details?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    admin_id?: string
                    action_type?: 'create_admin' | 'approve_therapist' | 'reject_therapist' | 'assign_patient'
                    target_user_id?: string | null
                    details?: Json | null
                    created_at?: string
                }
            }
            appointments: {
                Row: {
                    id: string
                    therapist_id: string
                    patient_id: string | null
                    start_time: string
                    end_time: string
                    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
                    notes: string | null
                    meeting_link: string | null
                    feedback: string | null
                    created_at: string
                    price: number
                    payment_required: boolean
                    payment_status: string
                    video_room_id: string | null
                    session_type: 'private' | 'public'
                    title: string | null
                    practice_id: string | null
                }
                Insert: {
                    id?: string
                    therapist_id: string
                    patient_id?: string | null
                    start_time: string
                    end_time: string
                    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
                    notes?: string | null
                    meeting_link?: string | null
                    feedback?: string | null
                    created_at?: string
                    price?: number
                    payment_required?: boolean
                    payment_status?: string
                    video_room_id?: string | null
                    session_type?: 'private' | 'public'
                    title?: string | null
                }
                Update: {
                    id?: string
                    therapist_id?: string
                    patient_id?: string | null
                    start_time?: string
                    end_time?: string
                    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
                    notes?: string | null
                    meeting_link?: string | null
                    feedback?: string | null
                    created_at?: string
                    price?: number
                    payment_required?: boolean
                    payment_status?: string
                    video_room_id?: string | null
                    session_type?: 'private' | 'public'
                    title?: string | null
                }
            }
            messages: {
                Row: {
                    id: string
                    sender_id: string
                    receiver_id: string
                    content: string
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    sender_id: string
                    receiver_id: string
                    content: string
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    sender_id?: string
                    receiver_id?: string
                    content?: string
                    is_read?: boolean
                    created_at?: string
                }
            }
            reviews: {
                Row: {
                    id: string
                    therapist_id: string
                    patient_id: string
                    appointment_id: string
                    rating: number
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    therapist_id: string
                    patient_id: string
                    appointment_id: string
                    rating: number
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    therapist_id?: string
                    patient_id?: string
                    appointment_id?: string
                    rating?: number
                    comment?: string | null
                    created_at?: string
                }
            }
            focus_areas: {
                Row: {
                    id: string
                    name: string
                }
                Insert: {
                    id?: string
                    name: string
                }
                Update: {
                    id?: string
                    name: string
                }
            }
            patient_goals: {
                Row: {
                    id: string
                    patient_id: string
                    therapist_id: string
                    goal_title: string
                    goal_description: string | null
                    progress_percentage: number
                    status: 'active' | 'completed' | 'paused'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    patient_id: string
                    therapist_id: string
                    goal_title: string
                    goal_description?: string | null
                    progress_percentage?: number
                    status: 'active' | 'completed' | 'paused'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    patient_id?: string
                    therapist_id?: string
                    goal_title?: string
                    goal_description?: string | null
                    progress_percentage?: number
                    status?: 'active' | 'completed' | 'paused'
                    created_at?: string
                    updated_at?: string
                }
            }
            therapist_notes: {
                Row: {
                    id: string
                    therapist_id: string
                    patient_id: string
                    note_content: string
                    is_private: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    therapist_id: string
                    patient_id: string
                    note_content: string
                    is_private?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    therapist_id?: string
                    patient_id?: string
                    note_content?: string
                    is_private?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            payments: {
                Row: {
                    id: string
                    appointment_id: string
                    patient_id: string
                    therapist_id: string
                    amount: number
                    currency: string
                    razorpay_order_id: string | null
                    razorpay_payment_id: string | null
                    razorpay_signature: string | null
                    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
                    payment_method: string
                    platform_fee: number | null
                    therapist_payout: number | null
                    failure_reason: string | null
                    metadata: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    appointment_id: string
                    patient_id: string
                    therapist_id: string
                    amount: number
                    currency?: string
                    razorpay_order_id?: string | null
                    razorpay_payment_id?: string | null
                    razorpay_signature?: string | null
                    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
                    payment_method?: string
                    platform_fee?: number | null
                    therapist_payout?: number | null
                    failure_reason?: string | null
                    metadata?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    appointment_id?: string
                    patient_id?: string
                    therapist_id?: string
                    amount?: number
                    currency?: string
                    razorpay_order_id?: string | null
                    razorpay_payment_id?: string | null
                    razorpay_signature?: string | null
                    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
                    payment_method?: string
                    platform_fee?: number | null
                    therapist_payout?: number | null
                    failure_reason?: string | null
                    metadata?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            video_rooms: {
                Row: {
                    id: string
                    appointment_id: string
                    room_name: string
                    room_url: string
                    provider: 'daily' | 'agora' | 'google_meet'
                    daily_room_id: string | null
                    therapist_token: string | null
                    patient_token: string | null
                    status: 'created' | 'active' | 'ended'
                    started_at: string | null
                    ended_at: string | null
                    duration_minutes: number | null
                    recording_enabled: boolean
                    recording_url: string | null
                    google_meet_space_name?: string | null
                    google_meet_code?: string | null
                    metadata: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    appointment_id: string
                    room_name: string
                    room_url: string
                    provider?: 'daily' | 'agora' | 'google_meet'
                    daily_room_id?: string | null
                    therapist_token?: string | null
                    patient_token?: string | null
                    status?: 'created' | 'active' | 'ended'
                    started_at?: string | null
                    ended_at?: string | null
                    duration_minutes?: number | null
                    recording_enabled?: boolean
                    recording_url?: string | null
                    google_meet_space_name?: string | null
                    google_meet_code?: string | null
                    metadata?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    appointment_id?: string
                    room_name?: string
                    room_url?: string
                    provider?: 'daily' | 'agora' | 'google_meet'
                    daily_room_id?: string | null
                    therapist_token?: string | null
                    patient_token?: string | null
                    status?: 'created' | 'active' | 'ended'
                    started_at?: string | null
                    ended_at?: string | null
                    duration_minutes?: number | null
                    recording_enabled?: boolean
                    recording_url?: string | null
                    google_meet_space_name?: string | null
                    google_meet_code?: string | null
                    metadata?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            whatsapp_messages: {
                Row: {
                    id: string
                    appointment_id: string | null
                    recipient_id: string
                    phone_number: string
                    message_type: 'confirmation' | 'reminder' | 'cancellation' | 'booking_link'
                    template_name: string | null
                    message_content: string | null
                    whatsapp_message_id: string | null
                    provider: 'twilio' | 'gupshup' | 'messagebird'
                    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
                    sent_at: string | null
                    delivered_at: string | null
                    read_at: string | null
                    failure_reason: string | null
                    metadata: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    appointment_id?: string | null
                    recipient_id: string
                    phone_number: string
                    message_type: 'confirmation' | 'reminder' | 'cancellation' | 'booking_link'
                    template_name?: string | null
                    message_content?: string | null
                    whatsapp_message_id?: string | null
                    provider?: 'twilio' | 'gupshup' | 'messagebird'
                    status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
                    sent_at?: string | null
                    delivered_at?: string | null
                    read_at?: string | null
                    failure_reason?: string | null
                    metadata?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    appointment_id?: string | null
                    recipient_id?: string
                    phone_number?: string
                    message_type?: 'confirmation' | 'reminder' | 'cancellation' | 'booking_link'
                    template_name?: string | null
                    message_content?: string | null
                    whatsapp_message_id?: string | null
                    provider?: 'twilio' | 'gupshup' | 'messagebird'
                    status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
                    sent_at?: string | null
                    delivered_at?: string | null
                    read_at?: string | null
                    failure_reason?: string | null
                    metadata?: Json | null
                    created_at?: string
                }
            }
            practices: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    logo_url: string | null
                    primary_color: string
                    secondary_color: string
                    accent_color: string
                    description: string | null
                    website_url: string | null
                    phone: string | null
                    email: string | null
                    address: string | null
                    city: string | null
                    state: string | null
                    country: string | null
                    subscription_tier: string
                    subscription_status: string
                    stripe_customer_id: string | null
                    owner_user_id: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    logo_url?: string | null
                    primary_color?: string
                    secondary_color?: string
                    accent_color?: string
                    description?: string | null
                    website_url?: string | null
                    phone?: string | null
                    email?: string | null
                    address?: string | null
                    city?: string | null
                    state?: string | null
                    country?: string | null
                    subscription_tier?: string
                    subscription_status?: string
                    stripe_customer_id?: string | null
                    owner_user_id: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    logo_url?: string | null
                    primary_color?: string
                    secondary_color?: string
                    accent_color?: string
                    description?: string | null
                    website_url?: string | null
                    phone?: string | null
                    email?: string | null
                    address?: string | null
                    city?: string | null
                    state?: string | null
                    country?: string | null
                    subscription_tier?: string
                    subscription_status?: string
                    stripe_customer_id?: string | null
                    owner_user_id?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            practice_settings: {
                Row: {
                    id: string
                    practice_id: string
                    allow_patient_booking: boolean
                    require_therapist_approval: boolean
                    default_session_duration_minutes: number
                    cancellation_policy_text: string | null
                    terms_of_service_url: string | null
                    privacy_policy_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    practice_id: string
                    allow_patient_booking?: boolean
                    require_therapist_approval?: boolean
                    default_session_duration_minutes?: number
                    cancellation_policy_text?: string | null
                    terms_of_service_url?: string | null
                    privacy_policy_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    practice_id?: string
                    allow_patient_booking?: boolean
                    require_therapist_approval?: boolean
                    default_session_duration_minutes?: number
                    cancellation_policy_text?: string | null
                    terms_of_service_url?: string | null
                    privacy_policy_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Appointment = Tables<'appointments'>
export type Message = Tables<'messages'>
export type Review = Tables<'reviews'>
export type FocusArea = Tables<'focus_areas'>
export type PatientGoal = Tables<'patient_goals'>
export type TherapistNote = Tables<'therapist_notes'>
export type TherapistPatientRelationship = Tables<'therapist_patient_relationships'>
export type PatientReferral = Tables<'patient_referrals'>
export type PatientInvitation = Tables<'patient_invitations'>
export type AdminAction = Tables<'admin_actions'>
export type Payment = Tables<'payments'>
export type VideoRoom = Tables<'video_rooms'>
export type WhatsAppMessage = Tables<'whatsapp_messages'>
export type Practice = Tables<'practices'>
export type PracticeSettings = Tables<'practice_settings'>

export type TherapistStats = {
    total_patients: number
    total_sessions: number
    upcoming_sessions: number
    pending_requests: number
}

export type AdminStats = {
    pending_approvals: number
    active_mentors: number
    total_patients: number
    total_admins: number
}

export type PatientWithActivity = {
    patient_id: string
    full_name: string | null
    avatar_url: string | null
    last_appointment_date: string | null
    last_appointment_status: string | null
    last_message_excerpt?: string | null
    last_message_at?: string | null
    last_activity_type?: 'message' | 'appointment' | 'none'
    status?: string
    relationship_status?: 'active' | 'inactive' | 'pending' | 'completed' | 'declined' | null
}

export type SessionRecording = Tables<'session_recordings'>
export type Transcript = Tables<'transcripts'>
