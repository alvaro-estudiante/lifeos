export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Database {
  public: {
    Tables: {
      pantry_items: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          quantity: number
          unit: string
          calories_per_100g: number | null
          protein_per_100g: number | null
          carbs_per_100g: number | null
          fat_per_100g: number | null
          fiber_per_100g: number | null
          expiry_date: string | null
          is_available: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          quantity: number
          unit: string
          calories_per_100g?: number | null
          protein_per_100g?: number | null
          carbs_per_100g?: number | null
          fat_per_100g?: number | null
          fiber_per_100g?: number | null
          expiry_date?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          quantity?: number
          unit?: string
          calories_per_100g?: number | null
          protein_per_100g?: number | null
          carbs_per_100g?: number | null
          fat_per_100g?: number | null
          fiber_per_100g?: number | null
          expiry_date?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      meals: {
        Row: {
          id: string
          user_id: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          meal_date: string
          meal_time: string | null
          total_calories: number | null
          total_protein: number | null
          total_carbs: number | null
          total_fat: number | null
          total_fiber: number | null
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          meal_date?: string
          meal_time?: string | null
          total_calories?: number | null
          total_protein?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_fiber?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          meal_date?: string
          meal_time?: string | null
          total_calories?: number | null
          total_protein?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_fiber?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      meal_items: {
        Row: {
          id: string
          meal_id: string
          food_name: string
          quantity: number
          unit: string
          calories: number | null
          protein: number | null
          carbs: number | null
          fat: number | null
          fiber: number | null
          from_pantry_id: string | null
          from_recipe_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          meal_id: string
          food_name: string
          quantity: number
          unit?: string
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
          fiber?: number | null
          from_pantry_id?: string | null
          from_recipe_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          meal_id?: string
          food_name?: string
          quantity?: number
          unit?: string
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
          fiber?: number | null
          from_pantry_id?: string | null
          from_recipe_id?: string | null
          created_at?: string
        }
      }
      nutrition_goals: {
        Row: {
          id: string
          user_id: string
          calories_target: number | null
          protein_g: number | null
          carbs_g: number | null
          fat_g: number | null
          fiber_g: number | null
          water_ml: number | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          calories_target?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          water_ml?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          calories_target?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          water_ml?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      exercises: {
        Row: {
          id: string
          user_id: string
          name: string
          muscle_group: 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms' | 'core' | 'quadriceps' | 'hamstrings' | 'glutes' | 'calves' | 'full_body' | 'cardio'
          equipment: string | null
          instructions: string | null
          video_url: string | null
          is_compound: boolean
          is_custom: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          muscle_group: 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms' | 'core' | 'quadriceps' | 'hamstrings' | 'glutes' | 'calves' | 'full_body' | 'cardio'
          equipment?: string | null
          instructions?: string | null
          video_url?: string | null
          is_compound?: boolean
          is_custom?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          muscle_group?: 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms' | 'core' | 'quadriceps' | 'hamstrings' | 'glutes' | 'calves' | 'full_body' | 'cardio'
          equipment?: string | null
          instructions?: string | null
          video_url?: string | null
          is_compound?: boolean
          is_custom?: boolean
          created_at?: string
        }
      }
      routines: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          type: 'strength' | 'hypertrophy' | 'endurance' | 'cardio' | 'mixed' | 'custom'
          days_per_week: number | null
          exercises: Json
          is_active: boolean
          is_ai_generated: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          type: 'strength' | 'hypertrophy' | 'endurance' | 'cardio' | 'mixed' | 'custom'
          days_per_week?: number | null
          exercises?: Json
          is_active?: boolean
          is_ai_generated?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          type?: 'strength' | 'hypertrophy' | 'endurance' | 'cardio' | 'mixed' | 'custom'
          days_per_week?: number | null
          exercises?: Json
          is_active?: boolean
          is_ai_generated?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          routine_id: string | null
          name: string | null
          workout_date: string
          start_time: string | null
          end_time: string | null
          duration_minutes: number | null
          total_volume: number | null
          notes: string | null
          energy_level: number | null
          overall_feeling: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          routine_id?: string | null
          name?: string | null
          workout_date?: string
          start_time?: string | null
          end_time?: string | null
          duration_minutes?: number | null
          total_volume?: number | null
          notes?: string | null
          energy_level?: number | null
          overall_feeling?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          routine_id?: string | null
          name?: string | null
          workout_date?: string
          start_time?: string | null
          end_time?: string | null
          duration_minutes?: number | null
          total_volume?: number | null
          notes?: string | null
          energy_level?: number | null
          overall_feeling?: number | null
          created_at?: string
          updated_at?: string | null
        }
      }
      workout_exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_id: string | null
          exercise_name: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_id?: string | null
          exercise_name: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_id?: string | null
          exercise_name?: string
          order_index?: number
          created_at?: string
        }
      }
      workout_sets: {
        Row: {
          id: string
          workout_exercise_id: string
          set_number: number
          reps: number | null
          weight_kg: number | null
          rpe: number | null
          is_warmup: boolean
          is_dropset: boolean
          is_failure: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workout_exercise_id: string
          set_number: number
          reps?: number | null
          weight_kg?: number | null
          rpe?: number | null
          is_warmup?: boolean
          is_dropset?: boolean
          is_failure?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workout_exercise_id?: string
          set_number?: number
          reps?: number | null
          weight_kg?: number | null
          rpe?: number | null
          is_warmup?: boolean
          is_dropset?: boolean
          is_failure?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date: string | null
          due_time: string | null
          estimated_minutes: number | null
          actual_minutes: number | null
          category: string | null
          tags: string[] | null
          parent_task_id: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string | null
          due_time?: string | null
          estimated_minutes?: number | null
          actual_minutes?: number | null
          category?: string | null
          tags?: string[] | null
          parent_task_id?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string | null
          due_time?: string | null
          estimated_minutes?: number | null
          actual_minutes?: number | null
          category?: string | null
          tags?: string[] | null
          parent_task_id?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          frequency: 'daily' | 'weekly' | 'custom'
          frequency_config: any | null
          target_value: number
          unit: string | null
          color: string
          icon: string | null
          is_active: boolean
          current_streak: number
          best_streak: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          frequency?: 'daily' | 'weekly' | 'custom'
          frequency_config?: any | null
          target_value?: number
          unit?: string | null
          color?: string
          icon?: string | null
          is_active?: boolean
          current_streak?: number
          best_streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          frequency?: 'daily' | 'weekly' | 'custom'
          frequency_config?: any | null
          target_value?: number
          unit?: string | null
          color?: string
          icon?: string | null
          is_active?: boolean
          current_streak?: number
          best_streak?: number
          created_at?: string
          updated_at?: string
        }
      }
      habit_logs: {
        Row: {
          id: string
          habit_id: string
          log_date: string
          value: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          log_date: string
          value?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          log_date?: string
          value?: number
          notes?: string | null
          created_at?: string
        }
      }
      sleep_logs: {
        Row: {
          id: string
          user_id: string
          sleep_date: string
          bed_time: string | null
          wake_time: string | null
          duration_hours: number | null
          quality: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sleep_date: string
          bed_time?: string | null
          wake_time?: string | null
          duration_hours?: number | null
          quality?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sleep_date?: string
          bed_time?: string | null
          wake_time?: string | null
          duration_hours?: number | null
          quality?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          birth_date: string | null
          gender: 'male' | 'female' | 'other' | null
          height_cm: number | null
          current_weight_kg: number | null
          target_weight_kg: number | null
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          fitness_goal: 'lose_fat' | 'maintain' | 'build_muscle' | 'recomposition' | 'health' | null
          dietary_restrictions: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          birth_date?: string | null
          gender?: 'male' | 'female' | 'other' | null
          height_cm?: number | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          fitness_goal?: 'lose_fat' | 'maintain' | 'build_muscle' | 'recomposition' | 'health' | null
          dietary_restrictions?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          birth_date?: string | null
          gender?: 'male' | 'female' | 'other' | null
          height_cm?: number | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          fitness_goal?: 'lose_fat' | 'maintain' | 'build_muscle' | 'recomposition' | 'health' | null
          dietary_restrictions?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'cash' | 'bank' | 'savings' | 'credit' | 'other'
          balance: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type?: 'cash' | 'bank' | 'savings' | 'credit' | 'other'
          balance?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'cash' | 'bank' | 'savings' | 'credit' | 'other'
          balance?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      finance_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'income' | 'expense'
          icon?: string | null
          color?: string | null
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount: number
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount: number
          month?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          amount?: number
          month?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          category_id: string | null
          amount: number
          type: 'income' | 'expense' | 'transfer'
          description: string | null
          transaction_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          category_id?: string | null
          amount: number
          type: 'income' | 'expense' | 'transfer'
          description?: string | null
          transaction_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          category_id?: string | null
          amount?: number
          type?: 'income' | 'expense' | 'transfer'
          description?: string | null
          transaction_date?: string
          created_at?: string
        }
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
  }
}