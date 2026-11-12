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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      branches: {
        Row: {
          address: string
          id: string
          name: string
        }
        Insert: {
          address?: string
          id: string
          name: string
        }
        Update: {
          address?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          birthdate: string
          branch_id: string | null
          cedula: string
          code: string
          email: string
          id: string
          joined_at: string
          name: string
          phone: string
          points: number
          stamps: number
          total_earned: number
          total_used: number
          user_id: string | null
          visits: number
        }
        Insert: {
          birthdate?: string
          branch_id?: string | null
          cedula: string
          code?: string
          email?: string
          id?: string
          joined_at?: string
          name?: string
          phone: string
          points?: number
          stamps?: number
          total_earned?: number
          total_used?: number
          user_id?: string | null
          visits?: number
        }
        Update: {
          birthdate?: string
          branch_id?: string | null
          cedula?: string
          code?: string
          email?: string
          id?: string
          joined_at?: string
          name?: string
          phone?: string
          points?: number
          stamps?: number
          total_earned?: number
          total_used?: number
          user_id?: string | null
          visits?: number
        }
        Relationships: [
          {
            foreignKeyName: "customers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      movements: {
        Row: {
          created_at: string
          customer_id: string
          description: string
          id: string
          points: number
          type: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          description: string
          id?: string
          points?: number
          type: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string
          id?: string
          points?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "movements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount: number
          branch_id: string | null
          created_at: string
          customer_id: string
          employee_id: string | null
          id: string
          order_number: string
          points: number
        }
        Insert: {
          amount: number
          branch_id?: string | null
          created_at?: string
          customer_id: string
          employee_id?: string | null
          id?: string
          order_number: string
          points?: number
        }
        Update: {
          amount?: number
          branch_id?: string | null
          created_at?: string
          customer_id?: string
          employee_id?: string | null
          id?: string
          order_number?: string
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchases_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      redemptions: {
        Row: {
          code: string
          cost: number
          created_at: string
          customer_id: string
          id: string
          reward_id: string
        }
        Insert: {
          code: string
          cost: number
          created_at?: string
          customer_id: string
          id?: string
          reward_id: string
        }
        Update: {
          code?: string
          cost?: number
          created_at?: string
          customer_id?: string
          id?: string
          reward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          active: boolean
          cost: number
          created_at: string
          description: string
          emoji: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          cost: number
          created_at?: string
          description?: string
          emoji?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          cost?: number
          created_at?: string
          description?: string
          emoji?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: number
          mode: string
          points_per_usd: number
          stamps_goal: number
          welcome_points: number
        }
        Insert: {
          id?: number
          mode?: string
          points_per_usd?: number
          stamps_goal?: number
          welcome_points?: number
        }
        Update: {
          id?: number
          mode?: string
          points_per_usd?: number
          stamps_goal?: number
          welcome_points?: number
        }
        Relationships: []
      }
      staff: {
        Row: {
          branch_id: string | null
          name: string
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          name: string
          user_id: string
        }
        Update: {
          branch_id?: string | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      mark_my_notifications_read: { Args: never; Returns: undefined }
      my_customer_id: { Args: never; Returns: string }
      redeem_reward: {
        Args: { _customer_id: string; _reward_id: string }
        Returns: Json
      }
      register_purchase: {
        Args: {
          _amount: number
          _branch: string
          _customer_id: string
          _order: string
        }
        Returns: Json
      }
      send_notifications: {
        Args: {
          _customer_ids: string[]
          _message: string
          _title: string
          _type: string
        }
        Returns: number
      }
      update_my_profile: {
        Args: { _birthdate: string; _email: string; _name: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "cajero"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "cajero"],
    },
  },
} as const
