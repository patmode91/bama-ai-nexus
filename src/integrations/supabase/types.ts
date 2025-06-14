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
      businesses: {
        Row: {
          businessname: string | null
          category: string | null
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
          rating: number | null
          tags: string[] | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          businessname?: string | null
          category?: string | null
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
          rating?: number | null
          tags?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          businessname?: string | null
          category?: string | null
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
          rating?: number | null
          tags?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
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
      [_ in never]: never
    }
    Functions: {
      get_saved_business_ids: {
        Args: { user_id: string }
        Returns: number[]
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
