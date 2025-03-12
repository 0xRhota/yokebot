import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
        }
      }
      workouts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          date: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          date: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          date?: string
          notes?: string | null
        }
      }
      exercises: {
        Row: {
          id: string
          workout_id: string
          name: string
          order: number
        }
        Insert: {
          id?: string
          workout_id: string
          name: string
          order: number
        }
        Update: {
          id?: string
          workout_id?: string
          name?: string
          order?: number
        }
      }
      sets: {
        Row: {
          id: string
          exercise_id: string
          weight: number
          reps: number
          rpe: number | null
        }
        Insert: {
          id?: string
          exercise_id: string
          weight: number
          reps: number
          rpe?: number | null
        }
        Update: {
          id?: string
          exercise_id?: string
          weight?: number
          reps?: number
          rpe?: number | null
        }
      }
    }
  }
} 