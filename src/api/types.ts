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
            profiles: {
                Row: {
                    user_id: string
                    role: 'mentor' | 'mentee' | 'admin'
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
                    mentor_bio_extended: string | null
                    certifications: string[] | null
                    is_super_admin: boolean
                }
                Insert: {
                    user_id: string
                    role: 'mentor' | 'mentee' | 'admin'
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
                    mentor_bio_extended?: string | null
                    certifications?: string[] | null
                    is_super_admin?: boolean
                }
                Update: {
                    user_id?: string
                    role?: 'mentor' | 'mentee' | 'admin'
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
                    mentor_bio_extended?: string | null
                    certifications?: string[] | null
                    is_super_admin?: boolean
                }
            }
            mentor_mentee_relationships: {
                Row: {
                    id: string
                    mentor_id: string
                    mentee_id: string
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
                    mentor_id: string
                    mentee_id: string
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
                    mentor_id?: string
                    mentee_id?: string
                    status?: 'active' | 'inactive' | 'pending' | 'completed' | 'declined'
                    assigned_date?: string
                    assigned_by?: string | null
                    end_date?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            mentee_referrals: {
                Row: {
                    id: string
                    mentee_id: string
                    referring_mentor_id: string
                    referred_to_mentor_id: string
                    status: 'pending' | 'accepted' | 'declined' | 'completed'
                    referral_reason: string
                    referral_notes: string | null
                    response_notes: string | null
                    created_at: string
                    responded_at: string | null
                }
                Insert: {
                    id?: string
                    mentee_id: string
                    referring_mentor_id: string
                    referred_to_mentor_id: string
                    status?: 'pending' | 'accepted' | 'declined' | 'completed'
                    referral_reason: string
                    referral_notes?: string | null
                    response_notes?: string | null
                    created_at?: string
                    responded_at?: string | null
                }
                Update: {
                    id?: string
                    mentee_id?: string
                    referring_mentor_id?: string
                    referred_to_mentor_id?: string
                    status?: 'pending' | 'accepted' | 'declined' | 'completed'
                    referral_reason?: string
                    referral_notes?: string | null
                    response_notes?: string | null
                    created_at?: string
                    responded_at?: string | null
                }
            }
            mentee_invitations: {
                Row: {
                    id: string
                    mentor_id: string
                    mentee_email: string
                    mentee_name: string | null
                    invitation_message: string | null
                    status: 'pending' | 'accepted' | 'expired'
                    invitation_token: string
                    expires_at: string
                    created_at: string
                    accepted_at: string | null
                }
                Insert: {
                    id?: string
                    mentor_id: string
                    mentee_email: string
                    mentee_name?: string | null
                    invitation_message?: string | null
                    status?: 'pending' | 'accepted' | 'expired'
                    invitation_token: string
                    expires_at: string
                    created_at?: string
                    accepted_at?: string | null
                }
                Update: {
                    id?: string
                    mentor_id?: string
                    mentee_email?: string
                    mentee_name?: string | null
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
                    action_type: 'create_admin' | 'approve_mentor' | 'reject_mentor' | 'assign_mentee'
                    target_user_id: string | null
                    details: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    admin_id: string
                    action_type: 'create_admin' | 'approve_mentor' | 'reject_mentor' | 'assign_mentee'
                    target_user_id?: string | null
                    details?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    admin_id?: string
                    action_type?: 'create_admin' | 'approve_mentor' | 'reject_mentor' | 'assign_mentee'
                    target_user_id?: string | null
                    details?: Json | null
                    created_at?: string
                }
            }
            appointments: {
                Row: {
                    id: string
                    mentor_id: string
                    mentee_id: string
                    start_time: string
                    end_time: string
                    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
                    notes: string | null
                    meeting_link: string | null
                    feedback: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    mentor_id: string
                    mentee_id: string
                    start_time: string
                    end_time: string
                    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
                    notes?: string | null
                    meeting_link?: string | null
                    feedback?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    mentor_id?: string
                    mentee_id?: string
                    start_time?: string
                    end_time?: string
                    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
                    notes?: string | null
                    meeting_link?: string | null
                    feedback?: string | null
                    created_at?: string
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
                    mentor_id: string
                    mentee_id: string
                    appointment_id: string
                    rating: number
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    mentor_id: string
                    mentee_id: string
                    appointment_id: string
                    rating: number
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    mentor_id?: string
                    mentee_id?: string
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
            mentee_goals: {
                Row: {
                    id: string
                    mentee_id: string
                    mentor_id: string
                    goal_title: string
                    goal_description: string | null
                    progress_percentage: number
                    status: 'active' | 'completed' | 'paused'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    mentee_id: string
                    mentor_id: string
                    goal_title: string
                    goal_description?: string | null
                    progress_percentage?: number
                    status: 'active' | 'completed' | 'paused'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    mentee_id?: string
                    mentor_id?: string
                    goal_title?: string
                    goal_description?: string | null
                    progress_percentage?: number
                    status?: 'active' | 'completed' | 'paused'
                    created_at?: string
                    updated_at?: string
                }
            }
            mentor_notes: {
                Row: {
                    id: string
                    mentor_id: string
                    mentee_id: string
                    note_content: string
                    is_private: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    mentor_id: string
                    mentee_id: string
                    note_content: string
                    is_private?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    mentor_id?: string
                    mentee_id?: string
                    note_content?: string
                    is_private?: boolean
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
export type MenteeGoal = Tables<'mentee_goals'>
export type MentorNote = Tables<'mentor_notes'>
export type MentorMenteeRelationship = Tables<'mentor_mentee_relationships'>
export type MenteeReferral = Tables<'mentee_referrals'>
export type MenteeInvitation = Tables<'mentee_invitations'>
export type AdminAction = Tables<'admin_actions'>

export type MentorStats = {
    total_mentees: number
    total_sessions: number
    upcoming_sessions: number
    pending_requests: number
}

export type AdminStats = {
    pending_approvals: number
    active_mentors: number
    total_mentees: number
    total_admins: number
}

export type MenteeWithActivity = {
    mentee_id: string
    full_name: string | null
    avatar_url: string | null
    last_appointment_date: string | null
    last_appointment_status: string | null
    last_message_excerpt?: string | null
    last_message_at?: string | null
    last_activity_type?: 'message' | 'appointment' | 'none'
    status?: string
    relationship_status?: 'active' | 'inactive' | 'pending' | 'completed' | null
}
