// This type is generated based on your Supabase database schema.
// You can generate this automatically using the Supabase CLI:
// npx supabase gen types typescript --project-id your-project-ref > types/supabase.ts

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
      // Define your database tables here
      // Example:
      // profiles: {
      //   Row: {}
      //   Insert: {}
      //   Update: {}
      // }
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

// This type will be used for type-safe client-side database access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
