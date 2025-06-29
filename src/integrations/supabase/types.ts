export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          business_id: number | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          business_id?: number | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          business_id?: number | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_claims: {
        Row: {
          admin_notes: string | null
          business_id: number
          claim_type: string
          created_at: string
          id: string
          status: string
          supporting_documents: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          business_id: number
          claim_type?: string
          created_at?: string
          id?: string
          status?: string
          supporting_documents?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          business_id?: number
          claim_type?: string
          created_at?: string
          id?: string
          status?: string
          supporting_documents?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_claims_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_embeddings: {
        Row: {
          business_id: number | null
          embedding: string | null
          id: string
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          business_id?: number | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          business_id?: number | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_embeddings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_updates: {
        Row: {
          business_id: number | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          title: string
          update_type: string
        }
        Insert: {
          business_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          update_type: string
        }
        Update: {
          business_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          update_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_updates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          businessname: string | null
          category: string | null
          certifications: string[] | null
          contactemail: string | null
          contactname: string | null
          created_at: string | null
          description: string | null
          employees_count: number | null
          founded_year: number | null
          id: number
          interestcheckbox: boolean | null
          location: string | null
          logo_url: string | null
          owner_id: string | null
          project_budget_max: number | null
          project_budget_min: number | null
          rating: number | null
          search_vector: unknown | null
          tags: string[] | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          businessname?: string | null
          category?: string | null
          certifications?: string[] | null
          contactemail?: string | null
          contactname?: string | null
          created_at?: string | null
          description?: string | null
          employees_count?: number | null
          founded_year?: number | null
          id?: never
          interestcheckbox?: boolean | null
          location?: string | null
          logo_url?: string | null
          owner_id?: string | null
          project_budget_max?: number | null
          project_budget_min?: number | null
          rating?: number | null
          search_vector?: unknown | null
          tags?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          businessname?: string | null
          category?: string | null
          certifications?: string[] | null
          contactemail?: string | null
          contactname?: string | null
          created_at?: string | null
          description?: string | null
          employees_count?: number | null
          founded_year?: number | null
          id?: never
          interestcheckbox?: boolean | null
          location?: string | null
          logo_url?: string | null
          owner_id?: string | null
          project_budget_max?: number | null
          project_budget_min?: number | null
          rating?: number | null
          search_vector?: unknown | null
          tags?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string | null
          metadata: Json | null
          room_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          room_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          metadata?: Json | null
          room_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          id: string
          joined_at: string | null
          last_read_at: string | null
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_private: boolean | null
          max_members: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          max_members?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          max_members?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      curation_requests: {
        Row: {
          action: string
          completed_at: string | null
          created_at: string
          error: string | null
          error_details: Json | null
          id: string
          metadata: Json | null
          result: Json | null
          session_id: string
          status: string
          target_id: string | null
          target_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          completed_at?: string | null
          created_at?: string
          error?: string | null
          error_details?: Json | null
          id?: string
          metadata?: Json | null
          result?: Json | null
          session_id: string
          status?: string
          target_id?: string | null
          target_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          completed_at?: string | null
          created_at?: string
          error?: string | null
          error_details?: Json | null
          id?: string
          metadata?: Json | null
          result?: Json | null
          session_id?: string
          status?: string
          target_id?: string | null
          target_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          business_id: number | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          event_date: string
          event_type: string | null
          featured_image: string | null
          id: string
          is_virtual: boolean | null
          location: string | null
          max_attendees: number | null
          meeting_url: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          venue_name: string | null
        }
        Insert: {
          business_id?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          event_date: string
          event_type?: string | null
          featured_image?: string | null
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_url?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          venue_name?: string | null
        }
        Update: {
          business_id?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          event_date?: string
          event_type?: string | null
          featured_image?: string | null
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_url?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          author_id: string
          category_id: string
          content: string
          created_at: string
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_id: string
          category_id: string
          content: string
          created_at?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_id?: string
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_votes: {
        Row: {
          created_at: string
          id: string
          reply_id: string | null
          topic_id: string | null
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reply_id?: string | null
          topic_id?: string | null
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reply_id?: string | null
          topic_id?: string | null
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_votes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          from_user_id: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          target_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          target_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          target_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          industry: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          industry?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quality_metrics: {
        Row: {
          entity_id: string
          entity_type: string
          evaluated_at: string
          evaluated_by: string | null
          id: string
          metrics: Json
          score: number
        }
        Insert: {
          entity_id: string
          entity_type: string
          evaluated_at?: string
          evaluated_by?: string | null
          id?: string
          metrics?: Json
          score: number
        }
        Update: {
          entity_id?: string
          entity_type?: string
          evaluated_at?: string
          evaluated_by?: string | null
          id?: string
          metrics?: Json
          score?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          business_id: number
          comment: string | null
          created_at: string
          id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: number
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: number
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_businesses: {
        Row: {
          business_id: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          business_id: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          business_id?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_businesses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      search_analytics: {
        Row: {
          clicked_business_id: number | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          results_count: number | null
          search_duration_ms: number | null
          search_filters: Json | null
          search_query: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          clicked_business_id?: number | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          results_count?: number | null
          search_duration_ms?: number | null
          search_filters?: Json | null
          search_query: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_business_id?: number | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          results_count?: number | null
          search_duration_ms?: number | null
          search_filters?: Json | null
          search_query?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_analytics_clicked_business_id_fkey"
            columns: ["clicked_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      search_suggestions: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          popularity_score: number | null
          suggestion: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          popularity_score?: number | null
          suggestion: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          popularity_score?: number | null
          suggestion?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      validation_rules: {
        Row: {
          created_at: string
          created_by: string | null
          entity_type: string
          error_message: string | null
          field_name: string
          id: string
          is_active: boolean
          rule_config: Json
          rule_type: string
          severity: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entity_type: string
          error_message?: string | null
          field_name: string
          id?: string
          is_active?: boolean
          rule_config?: Json
          rule_type: string
          severity?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entity_type?: string
          error_message?: string | null
          field_name?: string
          id?: string
          is_active?: boolean
          rule_config?: Json
          rule_type?: string
          severity?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          business_id: number
          created_at: string
          documents_url: string[] | null
          id: string
          requested_by: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          business_id: number
          created_at?: string
          documents_url?: string[] | null
          id?: string
          requested_by: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          business_id?: number
          created_at?: string
          documents_url?: string[] | null
          id?: string
          requested_by?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_curation_metrics: {
        Row: {
          action: string | null
          avg_processing_seconds: number | null
          error_count: number | null
          request_count: number | null
          status: string | null
          time_bucket: string | null
        }
        Relationships: []
      }
      vw_quality_metrics_summary: {
        Row: {
          avg_accuracy: number | null
          avg_completeness: number | null
          avg_score: number | null
          entity_type: string | null
          max_score: number | null
          median_score: number | null
          min_score: number | null
          total_metrics: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_admin_policy: {
        Args: { table_name: string }
        Returns: undefined
      }
      apply_authenticated_read_policy: {
        Args: { table_name: string }
        Returns: undefined
      }
      apply_public_read_policy: {
        Args: { table_name: string }
        Returns: undefined
      }
      apply_user_owned_policy: {
        Args: { table_name: string; user_id_column?: string }
        Returns: undefined
      }
      approve_business_claim: {
        Args: { claim_id: string }
        Returns: undefined
      }
      complete_curation_request: {
        Args: {
          p_request_id: string
          p_result?: Json
          p_error?: string
          p_error_details?: Json
        }
        Returns: undefined
      }
      generate_business_search_vector: {
        Args: {
          business_row: Database["public"]["Tables"]["businesses"]["Row"]
        }
        Returns: unknown
      }
      get_event_attendee_count: {
        Args: { event_uuid: string }
        Returns: number
      }
      get_saved_business_ids: {
        Args: { user_id: string }
        Returns: number[]
      }
      is_room_participant: {
        Args: { room_id_param: string; user_id_param: string }
        Returns: boolean
      }
      log_curation_request: {
        Args: {
          p_session_id: string
          p_user_id: string
          p_action: string
          p_target_type: string
          p_target_id?: string
        }
        Returns: string
      }
      match_businesses: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          business_id: number
          businessname: string
          description: string
          similarity: number
        }[]
      }
      save_business: {
        Args: { user_id: string; business_id: number }
        Returns: undefined
      }
      unsave_business: {
        Args: { user_id: string; business_id: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
