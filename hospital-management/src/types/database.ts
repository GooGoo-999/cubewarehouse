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
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string | null
          id: string
          name: string
          password: string
          role: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          password: string
          role: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          password?: string
          role?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      coils: {
        Row: {
          author: string
          coil_name: string
          coil_number: string
          created_at: string | null
          description: string
          id: string
          inbound_date: string
          location: string
          serial_number: string
          status: string
          updated_at: string | null
        }
        Insert: {
          author: string
          coil_name: string
          coil_number: string
          created_at?: string | null
          description: string
          id: string
          inbound_date: string
          location: string
          serial_number: string
          status: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          coil_name?: string
          coil_number?: string
          created_at?: string | null
          description?: string
          id?: string
          inbound_date?: string
          location?: string
          serial_number?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          address: string | null
          created_at: string | null
          equipment: string | null
          id: string
          modality: string | null
          name: string
          phone: string | null
          software_version: string | null
          system_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          equipment?: string | null
          id: string
          modality?: string | null
          name: string
          phone?: string | null
          software_version?: string | null
          system_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          equipment?: string | null
          id?: string
          modality?: string | null
          name?: string
          phone?: string | null
          software_version?: string | null
          system_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inout_history: {
        Row: {
          author: string
          created_at: string | null
          date: string
          id: string
          location: string
          notes: string
          part_name: string
          part_number: string
          serial_number: string
          type: string
          worker: string
        }
        Insert: {
          author: string
          created_at?: string | null
          date: string
          id: string
          location: string
          notes: string
          part_name: string
          part_number: string
          serial_number: string
          type: string
          worker: string
        }
        Update: {
          author?: string
          created_at?: string | null
          date?: string
          id?: string
          location?: string
          notes?: string
          part_name?: string
          part_number?: string
          serial_number?: string
          type?: string
          worker?: string
        }
        Relationships: []
      }
      outbound_history: {
        Row: {
          author: string
          created_at: string | null
          date: string
          hospital: string
          id: string
          notes: string
          part_name: string
          part_number: string
          serial_number: string
          worker: string
        }
        Insert: {
          author: string
          created_at?: string | null
          date: string
          hospital: string
          id: string
          notes: string
          part_name: string
          part_number: string
          serial_number: string
          worker: string
        }
        Update: {
          author?: string
          created_at?: string | null
          date?: string
          hospital?: string
          id?: string
          notes?: string
          part_name?: string
          part_number?: string
          serial_number?: string
          worker?: string
        }
        Relationships: []
      }
      outbound_parts: {
        Row: {
          author: string
          created_at: string | null
          date: string
          hospital: string
          id: string
          notes: string
          part_name: string
          part_number: string
          serial_number: string
          worker: string
        }
        Insert: {
          author: string
          created_at?: string | null
          date: string
          hospital: string
          id: string
          notes: string
          part_name: string
          part_number: string
          serial_number: string
          worker: string
        }
        Update: {
          author?: string
          created_at?: string | null
          date?: string
          hospital?: string
          id?: string
          notes?: string
          part_name?: string
          part_number?: string
          serial_number?: string
          worker?: string
        }
        Relationships: []
      }
      parts: {
        Row: {
          created_at: string | null
          error_content: string
          hospital_id: string | null
          hospital_name: string
          id: string
          part_name: string
          part_number: string
          replacement_date: string
          serial_number: string
          updated_at: string | null
          worker: string
        }
        Insert: {
          created_at?: string | null
          error_content: string
          hospital_id?: string | null
          hospital_name: string
          id: string
          part_name: string
          part_number: string
          replacement_date: string
          serial_number: string
          updated_at?: string | null
          worker: string
        }
        Update: {
          created_at?: string | null
          error_content?: string
          hospital_id?: string | null
          hospital_name?: string
          id?: string
          part_name?: string
          part_number?: string
          replacement_date?: string
          serial_number?: string
          updated_at?: string | null
          worker?: string
        }
        Relationships: [
          {
            foreignKeyName: "parts_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse: {
        Row: {
          author: string
          created_at: string | null
          description: string
          id: string
          inbound_date: string
          location: string
          part_name: string
          part_number: string
          serial_number: string
          status: string
          updated_at: string | null
        }
        Insert: {
          author: string
          created_at?: string | null
          description: string
          id: string
          inbound_date: string
          location: string
          part_name: string
          part_number: string
          serial_number: string
          status: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          created_at?: string | null
          description?: string
          id?: string
          inbound_date?: string
          location?: string
          part_name?: string
          part_number?: string
          serial_number?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
