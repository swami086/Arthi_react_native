export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      _internal_secrets: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      a2ui_actions: {
        Row: {
          action_id: string
          action_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          payload: Json | null
          surface_id: string
          user_id: string
        }
        Insert: {
          action_id: string
          action_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          payload?: Json | null
          surface_id: string
          user_id: string
        }
        Update: {
          action_id?: string
          action_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          payload?: Json | null
          surface_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "a2ui_actions_surface_id_fkey"
            columns: ["surface_id"]
            isOneToOne: false
            referencedRelation: "a2ui_surfaces"
            referencedColumns: ["surface_id"]
          },
        ]
      }
      a2ui_surfaces: {
        Row: {
          agent_id: string
          components: Json | null
          created_at: string | null
          data_model: Json | null
          id: string
          metadata: Json | null
          surface_id: string
          updated_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          agent_id: string
          components?: Json | null
          created_at?: string | null
          data_model?: Json | null
          id?: string
          metadata?: Json | null
          surface_id: string
          updated_at?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          agent_id?: string
          components?: Json | null
          created_at?: string | null
          data_model?: Json | null
          id?: string
          metadata?: Json | null
          surface_id?: string
          updated_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["admin_action_type"]
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      agent_conversations: {
        Row: {
          agent_type: string
          context: Json | null
          created_at: string | null
          id: string
          messages: Json
          metadata: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_type: string
          context?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json
          metadata?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_type?: string
          context?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json
          metadata?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_executions: {
        Row: {
          agent_type: string
          conversation_id: string | null
          cost_usd: number | null
          created_at: string | null
          duration_ms: number | null
          error: string | null
          id: string
          metadata: Json | null
          status: string | null
          tokens_used: number | null
          tool_calls: Json | null
        }
        Insert: {
          agent_type: string
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          tokens_used?: number | null
          tool_calls?: Json | null
        }
        Update: {
          agent_type?: string
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          tokens_used?: number | null
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_executions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_memory: {
        Row: {
          chunk_index: number | null
          content: string
          conversation_id: string | null
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string
          memory_type: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          chunk_index?: number | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          memory_type?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          chunk_index?: number | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          memory_type?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_memory_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tools: {
        Row: {
          created_at: string | null
          description: string
          enabled: boolean | null
          id: string
          name: string
          parameters: Json
          permissions: string[] | null
          rate_limit: Json | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          enabled?: boolean | null
          id?: string
          name: string
          parameters: Json
          permissions?: string[] | null
          rate_limit?: Json | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          enabled?: boolean | null
          id?: string
          name?: string
          parameters?: Json
          permissions?: string[] | null
          rate_limit?: Json | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          created_at: string | null
          id: string
          intent: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          intent: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          intent?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string | null
          end_time: string
          feedback: string | null
          id: string
          meeting_link: string | null
          notes: string | null
          patient_id: string | null
          payment_required: boolean | null
          payment_status: string | null
          practice_id: string | null
          price: number | null
          session_type: string | null
          start_time: string
          status: string
          therapist_id: string
          title: string | null
          updated_at: string | null
          video_room_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          feedback?: string | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          patient_id?: string | null
          payment_required?: boolean | null
          payment_status?: string | null
          practice_id?: string | null
          price?: number | null
          session_type?: string | null
          start_time: string
          status?: string
          therapist_id: string
          title?: string | null
          updated_at?: string | null
          video_room_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          feedback?: string | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          patient_id?: string | null
          payment_required?: boolean | null
          payment_status?: string | null
          practice_id?: string | null
          price?: number | null
          session_type?: string | null
          start_time?: string
          status?: string
          therapist_id?: string
          title?: string | null
          updated_at?: string | null
          video_room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_mentee_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "appointments_mentor_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "appointments_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_video_room_id_fkey"
            columns: ["video_room_id"]
            isOneToOne: false
            referencedRelation: "video_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          practice_id: string | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          practice_id?: string | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          practice_id?: string | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      biometrics: {
        Row: {
          created_at: string | null
          id: string
          patient_id: string | null
          practice_id: string | null
          source: string | null
          timestamp: string
          type: string
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          patient_id?: string | null
          practice_id?: string | null
          source?: string | null
          timestamp: string
          type: string
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          patient_id?: string | null
          practice_id?: string | null
          source?: string | null
          timestamp?: string
          type?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "biometrics_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "biometrics_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      biometrics_y2026m01: {
        Row: {
          created_at: string | null
          id: string
          patient_id: string | null
          practice_id: string | null
          source: string | null
          timestamp: string
          type: string
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          patient_id?: string | null
          practice_id?: string | null
          source?: string | null
          timestamp: string
          type: string
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          patient_id?: string | null
          practice_id?: string | null
          source?: string | null
          timestamp?: string
          type?: string
          value?: Json
        }
        Relationships: []
      }
      consents: {
        Row: {
          abha_id: string | null
          consent_artifact: Json | null
          consent_id: string | null
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          id: string
          patient_id: string | null
          practice_id: string | null
          purpose: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          abha_id?: string | null
          consent_artifact?: Json | null
          consent_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          patient_id?: string | null
          practice_id?: string | null
          purpose?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          abha_id?: string | null
          consent_artifact?: Json | null
          consent_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          patient_id?: string | null
          practice_id?: string | null
          purpose?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "consents_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          metadata: Json | null
          name: string
          rollout_percentage: number | null
          target_users: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          metadata?: Json | null
          name: string
          rollout_percentage?: number | null
          target_users?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          metadata?: Json | null
          name?: string
          rollout_percentage?: number | null
          target_users?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      focus_areas: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          practice_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          practice_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          practice_id?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mood_checkins: {
        Row: {
          checked_in_at: string | null
          created_at: string | null
          id: string
          mood_score: number
          notes: string | null
          patient_id: string
        }
        Insert: {
          checked_in_at?: string | null
          created_at?: string | null
          id?: string
          mood_score: number
          notes?: string | null
          patient_id: string
        }
        Update: {
          checked_in_at?: string | null
          created_at?: string | null
          id?: string
          mood_score?: number
          notes?: string | null
          patient_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          practice_id: string | null
          related_entity_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          practice_id?: string | null
          related_entity_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          practice_id?: string | null
          related_entity_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_assessments: {
        Row: {
          assessed_at: string | null
          assessment_type: string
          id: string
          metadata: Json | null
          patient_id: string | null
          responses: Json | null
          score: number | null
        }
        Insert: {
          assessed_at?: string | null
          assessment_type: string
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          responses?: Json | null
          score?: number | null
        }
        Update: {
          assessed_at?: string | null
          assessment_type?: string
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          responses?: Json | null
          score?: number | null
        }
        Relationships: []
      }
      patient_goals: {
        Row: {
          created_at: string | null
          goal_description: string | null
          goal_title: string
          id: string
          patient_id: string
          practice_id: string | null
          progress_percentage: number | null
          status: string
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          goal_description?: string | null
          goal_title: string
          id?: string
          patient_id: string
          practice_id?: string | null
          progress_percentage?: number | null
          status: string
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          goal_description?: string | null
          goal_title?: string
          id?: string
          patient_id?: string
          practice_id?: string | null
          progress_percentage?: number | null
          status?: string
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentee_goals_mentee_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mentee_goals_mentor_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "patient_goals_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_homework: {
        Row: {
          completed_at: string | null
          completion_status: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          patient_id: string
          therapist_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_status?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          patient_id: string
          therapist_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_status?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          patient_id?: string
          therapist_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      patient_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          expires_at: string
          id: string
          invitation_message: string | null
          invitation_token: string
          patient_email: string
          patient_name: string | null
          status: string | null
          therapist_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          invitation_message?: string | null
          invitation_token: string
          patient_email: string
          patient_name?: string | null
          status?: string | null
          therapist_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          invitation_message?: string | null
          invitation_token?: string
          patient_email?: string
          patient_name?: string | null
          status?: string | null
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_invitations_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      patient_referrals: {
        Row: {
          created_at: string | null
          id: string
          patient_id: string
          practice_id: string | null
          referral_notes: string | null
          referral_reason: string
          referred_to_therapist_id: string
          referring_therapist_id: string
          responded_at: string | null
          response_notes: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          patient_id: string
          practice_id?: string | null
          referral_notes?: string | null
          referral_reason: string
          referred_to_therapist_id: string
          referring_therapist_id: string
          responded_at?: string | null
          response_notes?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          patient_id?: string
          practice_id?: string | null
          referral_notes?: string | null
          referral_reason?: string
          referred_to_therapist_id?: string
          referring_therapist_id?: string
          responded_at?: string | null
          response_notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentee_referrals_mentee_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mentee_referrals_referred_to_mentor_id_fkey"
            columns: ["referred_to_therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mentee_referrals_referring_mentor_id_fkey"
            columns: ["referring_therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "patient_referrals_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          allergies: string[] | null
          created_at: string | null
          demographics: Json | null
          emergency_contact: Json | null
          id: string
          medications: string[] | null
          practice_id: string | null
          profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          allergies?: string[] | null
          created_at?: string | null
          demographics?: Json | null
          emergency_contact?: Json | null
          id?: string
          medications?: string[] | null
          practice_id?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          allergies?: string[] | null
          created_at?: string | null
          demographics?: Json | null
          emergency_contact?: Json | null
          id?: string
          medications?: string[] | null
          practice_id?: string | null
          profile_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payment_splits: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_id: string | null
          percentage: number | null
          processed_at: string | null
          razorpay_transfer_id: string | null
          recipient_id: string | null
          recipient_type: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_id?: string | null
          percentage?: number | null
          processed_at?: string | null
          razorpay_transfer_id?: string | null
          recipient_id?: string | null
          recipient_type: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_id?: string | null
          percentage?: number | null
          processed_at?: string | null
          razorpay_transfer_id?: string | null
          recipient_id?: string | null
          recipient_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_splits_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_splits_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string | null
          currency: string | null
          failure_reason: string | null
          id: string
          metadata: Json | null
          patient_id: string | null
          payment_method: string | null
          platform_fee: number | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string | null
          therapist_id: string | null
          therapist_payout: number | null
          updated_at: string | null
          upi_ref_id: string | null
          upi_status: string | null
          upi_transaction_id: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          payment_method?: string | null
          platform_fee?: number | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string | null
          therapist_id?: string | null
          therapist_payout?: number | null
          updated_at?: string | null
          upi_ref_id?: string | null
          upi_status?: string | null
          upi_transaction_id?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          payment_method?: string | null
          platform_fee?: number | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string | null
          therapist_id?: string | null
          therapist_payout?: number | null
          updated_at?: string | null
          upi_ref_id?: string | null
          upi_status?: string | null
          upi_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_mentee_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payments_mentor_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      practice_branding: {
        Row: {
          accent_color: string | null
          banner_image_url: string | null
          created_at: string | null
          custom_domain: string | null
          favicon_url: string | null
          font_family: string | null
          id: string
          logo_url: string | null
          practice_id: string
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          banner_image_url?: string | null
          created_at?: string | null
          custom_domain?: string | null
          favicon_url?: string | null
          font_family?: string | null
          id?: string
          logo_url?: string | null
          practice_id: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          banner_image_url?: string | null
          created_at?: string | null
          custom_domain?: string | null
          favicon_url?: string | null
          font_family?: string | null
          id?: string
          logo_url?: string | null
          practice_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_branding_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: true
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_invite_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          max_uses: number | null
          practice_id: string
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          practice_id: string
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          practice_id?: string
          used_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_invite_codes_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_settings: {
        Row: {
          allow_patient_booking: boolean | null
          cancellation_policy_text: string | null
          created_at: string | null
          default_session_duration_minutes: number | null
          id: string
          practice_id: string
          privacy_policy_url: string | null
          require_therapist_approval: boolean | null
          terms_of_service_url: string | null
          updated_at: string | null
        }
        Insert: {
          allow_patient_booking?: boolean | null
          cancellation_policy_text?: string | null
          created_at?: string | null
          default_session_duration_minutes?: number | null
          id?: string
          practice_id: string
          privacy_policy_url?: string | null
          require_therapist_approval?: boolean | null
          terms_of_service_url?: string | null
          updated_at?: string | null
        }
        Update: {
          allow_patient_booking?: boolean | null
          cancellation_policy_text?: string | null
          created_at?: string | null
          default_session_duration_minutes?: number | null
          id?: string
          practice_id?: string
          privacy_policy_url?: string | null
          require_therapist_approval?: boolean | null
          terms_of_service_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_settings_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: true
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practices: {
        Row: {
          accent_color: string | null
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          owner_user_id: string
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          slug: string
          state: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_user_id: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          state?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_user_id?: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          state?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      proactive_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_dismissed: boolean
          is_read: boolean
          message: string
          metadata: Json | null
          priority: string
          read_at: string | null
          scheduled_for: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority: string
          read_at?: string | null
          scheduled_for?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          scheduled_for?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_date: string | null
          approval_status: string | null
          approved_by: string | null
          avatar_url: string | null
          background_check_status: string | null
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          expertise_areas: string[] | null
          full_name: string | null
          hourly_rate: number | null
          is_available: boolean | null
          is_super_admin: boolean | null
          phone_number: string | null
          practice_id: string | null
          practice_role: string | null
          rating_average: number | null
          rejection_reason: string | null
          role: Database["public"]["Enums"]["user_role"]
          specialization: string | null
          therapist_bio_extended: string | null
          total_sessions: number | null
          updated_at: string | null
          user_id: string
          verification_documents: string[] | null
          years_of_experience: number | null
        }
        Insert: {
          approval_date?: string | null
          approval_status?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          background_check_status?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          expertise_areas?: string[] | null
          full_name?: string | null
          hourly_rate?: number | null
          is_available?: boolean | null
          is_super_admin?: boolean | null
          phone_number?: string | null
          practice_id?: string | null
          practice_role?: string | null
          rating_average?: number | null
          rejection_reason?: string | null
          role: Database["public"]["Enums"]["user_role"]
          specialization?: string | null
          therapist_bio_extended?: string | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id: string
          verification_documents?: string[] | null
          years_of_experience?: number | null
        }
        Update: {
          approval_date?: string | null
          approval_status?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          background_check_status?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          expertise_areas?: string[] | null
          full_name?: string | null
          hourly_rate?: number | null
          is_available?: boolean | null
          is_super_admin?: boolean | null
          phone_number?: string | null
          practice_id?: string | null
          practice_role?: string | null
          rating_average?: number | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specialization?: string | null
          therapist_bio_extended?: string | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string
          verification_documents?: string[] | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          appointment_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          is_flagged: boolean | null
          patient_id: string
          practice_id: string | null
          rating: number
          therapist_id: string
        }
        Insert: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          is_flagged?: boolean | null
          patient_id: string
          practice_id?: string | null
          rating: number
          therapist_id: string
        }
        Update: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          is_flagged?: boolean | null
          patient_id?: string
          practice_id?: string | null
          rating?: number
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_mentee_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_mentor_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_flags: {
        Row: {
          evidence: string | null
          flagged_at: string | null
          id: string
          metadata: Json | null
          patient_id: string | null
          risk_type: string
          session_id: string | null
          severity: string
        }
        Insert: {
          evidence?: string | null
          flagged_at?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          risk_type: string
          session_id?: string | null
          severity: string
        }
        Update: {
          evidence?: string | null
          flagged_at?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          risk_type?: string
          session_id?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_flags_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          channel: string
          created_at: string | null
          error: string | null
          id: string
          message: string
          scheduled_for: string
          sent_at: string | null
          status: string | null
          template_name: string | null
          template_params: Json | null
          to: string
          updated_at: string | null
        }
        Insert: {
          channel?: string
          created_at?: string | null
          error?: string | null
          id?: string
          message: string
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          template_name?: string | null
          template_params?: Json | null
          to: string
          updated_at?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          error?: string | null
          id?: string
          message?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          template_name?: string | null
          template_params?: Json | null
          to?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      session_recordings: {
        Row: {
          appointment_id: string
          consent_captured: boolean | null
          consent_method: string | null
          consent_timestamp: string | null
          consent_version: number | null
          created_at: string | null
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          patient_id: string
          practice_id: string | null
          recording_status:
            | Database["public"]["Enums"]["recording_status_enum"]
            | null
          recording_url: string | null
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          appointment_id: string
          consent_captured?: boolean | null
          consent_method?: string | null
          consent_timestamp?: string | null
          consent_version?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          patient_id: string
          practice_id?: string | null
          recording_status?:
            | Database["public"]["Enums"]["recording_status_enum"]
            | null
          recording_url?: string | null
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string
          consent_captured?: boolean | null
          consent_method?: string | null
          consent_timestamp?: string | null
          consent_version?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          patient_id?: string
          practice_id?: string | null
          recording_status?:
            | Database["public"]["Enums"]["recording_status_enum"]
            | null
          recording_url?: string | null
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_recordings_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_recordings_mentee_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "session_recordings_mentor_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "session_recordings_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          appointment_id: string | null
          audio_duration_seconds: number | null
          audio_url: string | null
          created_at: string | null
          end_time: string | null
          id: string
          practice_id: string | null
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          audio_duration_seconds?: number | null
          audio_url?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          practice_id?: string | null
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          audio_duration_seconds?: number | null
          audio_url?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          practice_id?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      soap_notes: {
        Row: {
          appointment_id: string
          assessment: string | null
          created_at: string | null
          edited_by_therapist: boolean | null
          id: string
          is_finalized: boolean | null
          objective: string | null
          plan: string | null
          practice_id: string | null
          subjective: string | null
          therapist_id: string
          transcript_id: string
          updated_at: string | null
        }
        Insert: {
          appointment_id: string
          assessment?: string | null
          created_at?: string | null
          edited_by_therapist?: boolean | null
          id?: string
          is_finalized?: boolean | null
          objective?: string | null
          plan?: string | null
          practice_id?: string | null
          subjective?: string | null
          therapist_id: string
          transcript_id: string
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string
          assessment?: string | null
          created_at?: string | null
          edited_by_therapist?: boolean | null
          id?: string
          is_finalized?: boolean | null
          objective?: string | null
          plan?: string | null
          practice_id?: string | null
          subjective?: string | null
          therapist_id?: string
          transcript_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "soap_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "soap_notes_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: true
            referencedRelation: "transcripts"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_availability: {
        Row: {
          created_at: string | null
          day_of_week: string
          id: string
          therapist_id: string
          time_slots: string[] | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          id?: string
          therapist_id: string
          time_slots?: string[] | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          id?: string
          therapist_id?: string
          time_slots?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_availability_mentor_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      therapist_notes: {
        Row: {
          created_at: string | null
          id: string
          is_private: boolean | null
          note_content: string
          patient_id: string
          practice_id: string | null
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          note_content: string
          patient_id: string
          practice_id?: string | null
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          note_content?: string
          patient_id?: string
          practice_id?: string | null
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_notes_mentee_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mentor_notes_mentor_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "therapist_notes_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_patient_relationships: {
        Row: {
          assigned_by: string | null
          assigned_date: string | null
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          patient_id: string
          practice_id: string | null
          status: string
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_date?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          practice_id?: string | null
          status?: string
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_date?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          practice_id?: string | null
          status?: string
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_mentee_relationships_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mentor_mentee_relationships_mentee_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mentor_mentee_relationships_mentor_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "therapist_patient_relationships_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          language_detected: string | null
          practice_id: string | null
          processing_time_ms: number | null
          recording_id: string
          transcript_text: string
          whisper_model_used: string | null
          word_count: number | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          language_detected?: string | null
          practice_id?: string | null
          processing_time_ms?: number | null
          recording_id: string
          transcript_text: string
          whisper_model_used?: string | null
          word_count?: number | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          language_detected?: string | null
          practice_id?: string | null
          processing_time_ms?: number | null
          recording_id?: string
          transcript_text?: string
          whisper_model_used?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: true
            referencedRelation: "session_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_agent_preferences: {
        Row: {
          classic_mode: boolean | null
          created_at: string | null
          data_sharing_consent: boolean | null
          enabled_agents: string[] | null
          language_preference: string | null
          notification_frequency: string | null
          onboarding_completed: boolean | null
          quiet_hours: Json | null
          transparency_level: string | null
          updated_at: string | null
          user_id: string
          wellness_check_frequency: string | null
        }
        Insert: {
          classic_mode?: boolean | null
          created_at?: string | null
          data_sharing_consent?: boolean | null
          enabled_agents?: string[] | null
          language_preference?: string | null
          notification_frequency?: string | null
          onboarding_completed?: boolean | null
          quiet_hours?: Json | null
          transparency_level?: string | null
          updated_at?: string | null
          user_id: string
          wellness_check_frequency?: string | null
        }
        Update: {
          classic_mode?: boolean | null
          created_at?: string | null
          data_sharing_consent?: boolean | null
          enabled_agents?: string[] | null
          language_preference?: string | null
          notification_frequency?: string | null
          onboarding_completed?: boolean | null
          quiet_hours?: Json | null
          transparency_level?: string | null
          updated_at?: string | null
          user_id?: string
          wellness_check_frequency?: string | null
        }
        Relationships: []
      }
      video_rooms: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          daily_room_id: string | null
          duration_minutes: number | null
          ended_at: string | null
          google_meet_code: string | null
          google_meet_space_name: string | null
          id: string
          metadata: Json | null
          patient_token: string | null
          provider: string | null
          recording_enabled: boolean | null
          recording_url: string | null
          room_name: string
          room_url: string
          started_at: string | null
          status: string | null
          therapist_token: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          daily_room_id?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          google_meet_code?: string | null
          google_meet_space_name?: string | null
          id?: string
          metadata?: Json | null
          patient_token?: string | null
          provider?: string | null
          recording_enabled?: boolean | null
          recording_url?: string | null
          room_name: string
          room_url: string
          started_at?: string | null
          status?: string | null
          therapist_token?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          daily_room_id?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          google_meet_code?: string | null
          google_meet_space_name?: string | null
          id?: string
          metadata?: Json | null
          patient_token?: string | null
          provider?: string | null
          recording_enabled?: boolean | null
          recording_url?: string | null
          room_name?: string
          room_url?: string
          started_at?: string | null
          status?: string | null
          therapist_token?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_rooms_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      wellness_checks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          flagged_for_review: boolean | null
          id: string
          mood_score: number | null
          responses: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          flagged_for_review?: boolean | null
          id?: string
          mood_score?: number | null
          responses?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          flagged_for_review?: boolean | null
          id?: string
          mood_score?: number | null
          responses?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      whatsapp_logs: {
        Row: {
          created_at: string | null
          id: string
          message: string
          sent_at: string | null
          status: string | null
          template_name: string | null
          to: string
          twilio_sid: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          sent_at?: string | null
          status?: string | null
          template_name?: string | null
          to: string
          twilio_sid?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          sent_at?: string | null
          status?: string | null
          template_name?: string | null
          to?: string
          twilio_sid?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          delivered_at: string | null
          failure_reason: string | null
          id: string
          message_content: string | null
          message_type: string
          metadata: Json | null
          phone_number: string
          provider: string | null
          read_at: string | null
          recipient_id: string | null
          sent_at: string | null
          status: string | null
          template_name: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          failure_reason?: string | null
          id?: string
          message_content?: string | null
          message_type: string
          metadata?: Json | null
          phone_number: string
          provider?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sent_at?: string | null
          status?: string | null
          template_name?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          failure_reason?: string | null
          id?: string
          message_content?: string | null
          message_type?: string
          metadata?: Json | null
          phone_number?: string
          provider?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sent_at?: string | null
          status?: string | null
          template_name?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      agent_performance_dashboard: {
        Row: {
          agent_type: string | null
          avg_duration_ms: number | null
          date: string | null
          executions: number | null
          failures: number | null
          total_cost_usd: number | null
          total_tokens: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_therapist_rpc: {
        Args: { admin_id: string; notes?: string; therapist_id: string }
        Returns: undefined
      }
      check_is_admin: { Args: never; Returns: boolean }
      check_is_super_admin: { Args: never; Returns: boolean }
      check_therapist_availability: {
        Args: {
          p_end_time: string
          p_start_time: string
          p_therapist_id: string
        }
        Returns: boolean
      }
      create_admin_account: {
        Args: {
          email_input: string
          full_name_input: string
          is_super_admin_input?: boolean
        }
        Returns: Json
      }
      current_practice_id: { Args: never; Returns: string }
      get_admin_dashboard_stats: { Args: never; Returns: Json }
      get_available_patients_for_therapist: {
        Args: { therapist_id_input: string }
        Returns: {
          avatar_url: string
          full_name: string
          patient_id: string
          specialization: string
        }[]
      }
      get_my_practice_id: { Args: never; Returns: string }
      get_patient_list_for_therapist: {
        Args: { therapist_user_id: string }
        Returns: Json
      }
      get_therapist_booked_slots: {
        Args: {
          p_end_date: string
          p_start_date: string
          p_therapist_id: string
        }
        Returns: {
          end_time: string
          start_time: string
        }[]
      }
      get_therapist_relationships: {
        Args: { therapist_id_input: string }
        Returns: {
          assigned_by: string | null
          assigned_date: string | null
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          patient_id: string
          practice_id: string | null
          status: string
          therapist_id: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "therapist_patient_relationships"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_therapist_stats: {
        Args: { therapist_user_id: string }
        Returns: Json
      }
      is_feature_enabled: {
        Args: { check_user_id: string; flag_name: string }
        Returns: boolean
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      reject_therapist_rpc: {
        Args: { admin_id: string; reason: string; therapist_id: string }
        Returns: undefined
      }
      search_agent_memory: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
          query_memory_types: string[]
          query_user_id: string
        }
        Returns: {
          content: string
          created_at: string
          id: string
          memory_type: string
          metadata: Json
          similarity: number
          user_id: string
        }[]
      }
      search_available_patients: {
        Args: {
          category_input?: string
          search_query_input?: string
          therapist_id_input: string
        }
        Returns: {
          approval_date: string | null
          approval_status: string | null
          approved_by: string | null
          avatar_url: string | null
          background_check_status: string | null
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          expertise_areas: string[] | null
          full_name: string | null
          hourly_rate: number | null
          is_available: boolean | null
          is_super_admin: boolean | null
          phone_number: string | null
          practice_id: string | null
          practice_role: string | null
          rating_average: number | null
          rejection_reason: string | null
          role: Database["public"]["Enums"]["user_role"]
          specialization: string | null
          therapist_bio_extended: string | null
          total_sessions: number | null
          updated_at: string | null
          user_id: string
          verification_documents: string[] | null
          years_of_experience: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      admin_action_type:
        | "create_admin"
        | "approve_therapist"
        | "reject_therapist"
        | "assign_patient"
      recording_status_enum: "recording" | "processing" | "completed" | "failed"
      user_role: "therapist" | "patient" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_action_type: [
        "create_admin",
        "approve_therapist",
        "reject_therapist",
        "assign_patient",
      ],
      recording_status_enum: ["recording", "processing", "completed", "failed"],
      user_role: ["therapist", "patient", "admin"],
    },
  },
} as const
