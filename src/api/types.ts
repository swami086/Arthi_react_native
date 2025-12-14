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
                    role: 'mentor' | 'mentee'
                    full_name: string | null
                    bio: string | null
                    avatar_url: string | null
                    expertise_areas: string[] | null
                    created_at: string
                }
                Insert: {

                    user_id: string
                    role: 'mentor' | 'mentee'
                    full_name?: string | null
                    bio?: string | null
                    avatar_url?: string | null
                    expertise_areas?: string[] | null
                    created_at?: string
                }
                Update: {

                    user_id?: string
                    role?: 'mentor' | 'mentee'
                    full_name?: string | null
                    bio?: string | null
                    avatar_url?: string | null
                    expertise_areas?: string[] | null
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
                    created_at: string
                }
                Insert: {
                    id?: string
                    mentor_id: string
                    mentee_id: string
                    start_time: string
                    end_time: string
                    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
                    created_at?: string
                }
                Update: {
                    id?: string
                    mentor_id?: string
                    mentee_id?: string
                    start_time?: string
                    end_time?: string
                    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
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
                    name?: string
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
