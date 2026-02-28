export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          avatar_url: string | null;
          bio: string;
          joined_at: string;
          notification_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nickname: string;
          avatar_url?: string | null;
          bio?: string;
          joined_at?: string;
          notification_enabled?: boolean;
        };
        Update: {
          id?: string;
          nickname?: string;
          avatar_url?: string | null;
          bio?: string;
          joined_at?: string;
          notification_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gratitude_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          discovery: string;
          reason: string;
          order_index: number;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          discovery: string;
          reason?: string;
          order_index?: number;
          is_public?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          discovery?: string;
          reason?: string;
          order_index?: number;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gratitude_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      meditation_reflections: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          jft_title: string;
          jft_content: string;
          reflection: string | null;
          prayer: string | null;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          jft_title: string;
          jft_content: string;
          reflection?: string | null;
          prayer?: string | null;
          memo?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          jft_title?: string;
          jft_content?: string;
          reflection?: string | null;
          prayer?: string | null;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meditation_reflections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      reactions: {
        Row: {
          id: string;
          user_id: string;
          entry_id: string;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_id: string;
          type: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entry_id?: string;
          type?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reactions_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "gratitude_entries";
            referencedColumns: ["id"];
          }
        ];
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          entry_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_id: string;
          content: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entry_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "gratitude_entries";
            referencedColumns: ["id"];
          }
        ];
      };
      meetings: {
        Row: {
          id: string;
          name: string;
          day_of_week: string | null;
          time: string | null;
          location_name: string | null;
          address: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          description: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          day_of_week?: string | null;
          time?: string | null;
          location_name?: string | null;
          address?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          day_of_week?: string | null;
          time?: string | null;
          location_name?: string | null;
          address?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meetings_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// 편의 타입
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type GratitudeEntry = Database["public"]["Tables"]["gratitude_entries"]["Row"];
export type MeditationReflection = Database["public"]["Tables"]["meditation_reflections"]["Row"];
export type Reaction = Database["public"]["Tables"]["reactions"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Meeting = Database["public"]["Tables"]["meetings"]["Row"];

export type ReactionType = "like" | "cheer" | "pray" | "heart";

export const REACTION_EMOJI: Record<ReactionType, string> = {
  like: "👍",
  cheer: "🎉",
  pray: "🙏",
  heart: "❤️",
};
