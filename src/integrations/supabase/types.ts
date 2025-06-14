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
      game_guesses: {
        Row: {
          guess_order: number
          guess_text: string
          id: string
          is_correct: boolean
          session_id: string
          timestamp: string | null
        }
        Insert: {
          guess_order: number
          guess_text: string
          id?: string
          is_correct: boolean
          session_id: string
          timestamp?: string | null
        }
        Update: {
          guess_order?: number
          guess_text?: string
          id?: string
          is_correct?: boolean
          session_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_guesses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          attempts: number | null
          correct_guess: string | null
          created_at: string | null
          end_time: string | null
          hints_used: number | null
          id: string
          match_id: string | null
          player_name: string | null
          score: number | null
          start_time: string | null
          status: Database["public"]["Enums"]["game_status"] | null
          time_limit_seconds: number | null
          word_id: string
        }
        Insert: {
          attempts?: number | null
          correct_guess?: string | null
          created_at?: string | null
          end_time?: string | null
          hints_used?: number | null
          id?: string
          match_id?: string | null
          player_name?: string | null
          score?: number | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["game_status"] | null
          time_limit_seconds?: number | null
          word_id: string
        }
        Update: {
          attempts?: number | null
          correct_guess?: string | null
          created_at?: string | null
          end_time?: string | null
          hints_used?: number | null
          id?: string
          match_id?: string | null
          player_name?: string | null
          score?: number | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["game_status"] | null
          time_limit_seconds?: number | null
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard: {
        Row: {
          attempts: number
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          hints_used: number | null
          id: string
          player_name: string
          score: number
          time_seconds: number
          word: string
        }
        Insert: {
          attempts: number
          created_at?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          hints_used?: number | null
          id?: string
          player_name: string
          score: number
          time_seconds: number
          word: string
        }
        Update: {
          attempts?: number
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          hints_used?: number | null
          id?: string
          player_name?: string
          score?: number
          time_seconds?: number
          word?: string
        }
        Relationships: []
      }
      match_leaderboard: {
        Row: {
          created_at: string
          email: string | null
          id: string
          player_name: string
          total_score: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          player_name: string
          total_score: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          player_name?: string
          total_score?: number
        }
        Relationships: []
      }
      words: {
        Row: {
          category: string | null
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          emoji: string
          id: string
          word: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          emoji: string
          id?: string
          word: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          emoji?: string
          id?: string
          word?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_random_word: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          word: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          category: string
          emoji: string
        }[]
      }
    }
    Enums: {
      difficulty_level: "easy" | "medium" | "hard"
      game_status: "active" | "completed" | "abandoned"
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
    Enums: {
      difficulty_level: ["easy", "medium", "hard"],
      game_status: ["active", "completed", "abandoned"],
    },
  },
} as const
