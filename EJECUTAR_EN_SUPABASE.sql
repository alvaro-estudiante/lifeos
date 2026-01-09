-- =============================================
-- LIFEOS - SCRIPT COMPLETO PARA SUPABASE
-- Copiar TODO y pegar en SQL Editor de Supabase
-- =============================================

-- =============================================
-- PARTE 1: USUARIOS Y PERFILES
-- =============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm NUMERIC(5,2),
  current_weight_kg NUMERIC(5,2),
  target_weight_kg NUMERIC(5,2),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  fitness_goal TEXT CHECK (fitness_goal IN ('lose_fat', 'maintain', 'build_muscle', 'recomposition', 'health')),
  dietary_restrictions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their profile" ON user_profiles FOR ALL USING (auth.uid() = id);

-- =============================================
-- PARTE 2: NUTRICIÓN
-- =============================================

CREATE TABLE IF NOT EXISTS nutrition_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calories_target INTEGER,
  protein_g INTEGER,
  carbs_g INTEGER,
  fat_g INTEGER,
  fiber_g INTEGER,
  water_ml INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL,
  calories_per_100g NUMERIC(8,2),
  protein_per_100g NUMERIC(8,2),
  carbs_per_100g NUMERIC(8,2),
  fat_per_100g NUMERIC(8,2),
  fiber_per_100g NUMERIC(8,2),
  expiry_date DATE,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  meal_date DATE DEFAULT CURRENT_DATE,
  meal_time TIME,
  total_calories NUMERIC(8,2),
  total_protein NUMERIC(8,2),
  total_carbs NUMERIC(8,2),
  total_fat NUMERIC(8,2),
  total_fiber NUMERIC(8,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT DEFAULT 'g',
  calories NUMERIC(8,2),
  protein NUMERIC(8,2),
  carbs NUMERIC(8,2),
  fat NUMERIC(8,2),
  fiber NUMERIC(8,2),
  from_pantry_id UUID REFERENCES pantry_items(id) ON DELETE SET NULL,
  from_recipe_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own nutrition_goals" ON nutrition_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own pantry_items" ON pantry_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own meals" ON meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own meal_items" ON meal_items FOR ALL 
  USING (EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid()));

-- =============================================
-- PARTE 3: FITNESS
-- =============================================

CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_group TEXT CHECK (muscle_group IN ('chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'core', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'full_body', 'cardio')) NOT NULL,
  equipment TEXT,
  instructions TEXT,
  video_url TEXT,
  is_compound BOOLEAN DEFAULT false,
  is_custom BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('strength', 'hypertrophy', 'endurance', 'cardio', 'mixed', 'custom')) NOT NULL,
  days_per_week INTEGER,
  exercises JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
  name TEXT,
  workout_date DATE DEFAULT CURRENT_DATE,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER,
  total_volume NUMERIC(10,2),
  notes TEXT,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  overall_feeling INTEGER CHECK (overall_feeling BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  exercise_name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg NUMERIC(6,2),
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
  is_warmup BOOLEAN DEFAULT false,
  is_dropset BOOLEAN DEFAULT false,
  is_failure BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own exercises" ON exercises FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own routines" ON routines FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own workouts" ON workouts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own workout_exercises" ON workout_exercises FOR ALL 
  USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY "Users own workout_sets" ON workout_sets FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM workout_exercises we 
    JOIN workouts w ON w.id = we.workout_id 
    WHERE we.id = workout_sets.workout_exercise_id AND w.user_id = auth.uid()
  ));

-- =============================================
-- PARTE 4: PRODUCTIVIDAD (TAREAS)
-- =============================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  due_date DATE,
  due_time TIME,
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  category TEXT,
  tags TEXT[],
  parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- PARTE 5: HÁBITOS
-- =============================================

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'custom')) DEFAULT 'daily',
  frequency_config JSONB,
  target_value INTEGER DEFAULT 1,
  unit TEXT,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE DEFAULT CURRENT_DATE,
  value INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, log_date)
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own habits" ON habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own habit_logs" ON habit_logs FOR ALL 
  USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()));

-- =============================================
-- PARTE 6: SUEÑO
-- =============================================

CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_date DATE DEFAULT CURRENT_DATE,
  bed_time TIME,
  wake_time TIME,
  duration_hours NUMERIC(4,2),
  quality INTEGER CHECK (quality BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sleep_date)
);

ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own sleep_logs" ON sleep_logs FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- PARTE 7: FINANZAS
-- =============================================

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('cash', 'bank', 'savings', 'credit', 'other')) DEFAULT 'bank',
  balance NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES finance_categories(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  month DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, month)
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES finance_categories(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense', 'transfer')),
  description TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own categories" ON finance_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- PARTE 8: RECETAS
-- =============================================

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  prep_time INTEGER DEFAULT 0,
  cook_time INTEGER DEFAULT 0,
  servings INTEGER DEFAULT 2,
  calories NUMERIC(8,2),
  protein NUMERIC(8,2),
  carbs NUMERIC(8,2),
  fat NUMERIC(8,2),
  ingredients JSONB DEFAULT '[]',
  instructions JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  is_ai_generated BOOLEAN DEFAULT false,
  is_saved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own recipes" ON recipes FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- PARTE 9: ÍNDICES PARA RENDIMIENTO
-- =============================================

CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, meal_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due ON tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_habits_user_active ON habits(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(habit_id, log_date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id);

-- =============================================
-- PARTE 10: TRIGGER PARA NUEVOS USUARIOS
-- Crea automáticamente perfil, objetivos y datos iniciales
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Crear perfil de usuario
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  
  -- Crear objetivos nutricionales por defecto
  INSERT INTO public.nutrition_goals (user_id, calories_target, protein_g, carbs_g, fat_g, fiber_g, water_ml, is_active)
  VALUES (NEW.id, 2000, 150, 200, 65, 30, 2500, true);
  
  -- Crear cuenta de efectivo por defecto
  INSERT INTO public.accounts (user_id, name, type, balance, currency)
  VALUES (NEW.id, 'Efectivo', 'cash', 0, 'EUR');

  -- Categorías de gasto por defecto
  INSERT INTO public.finance_categories (user_id, name, type, icon, color) VALUES 
    (NEW.id, 'Comida', 'expense', '🍔', '#ef4444'),
    (NEW.id, 'Transporte', 'expense', '🚌', '#3b82f6'),
    (NEW.id, 'Vivienda', 'expense', '🏠', '#8b5cf6'),
    (NEW.id, 'Ocio', 'expense', '🎉', '#ec4899'),
    (NEW.id, 'Salud', 'expense', '💊', '#10b981'),
    (NEW.id, 'Ropa', 'expense', '👕', '#f59e0b'),
    (NEW.id, 'Tecnología', 'expense', '💻', '#6366f1'),
    (NEW.id, 'Otros', 'expense', '📦', '#64748b');

  -- Categorías de ingreso por defecto
  INSERT INTO public.finance_categories (user_id, name, type, icon, color) VALUES 
    (NEW.id, 'Salario', 'income', '💰', '#10b981'),
    (NEW.id, 'Regalos', 'income', '🎁', '#f472b6'),
    (NEW.id, 'Otros Ingresos', 'income', '📦', '#64748b');

  -- Hábitos de ejemplo
  INSERT INTO public.habits (user_id, name, description, frequency, target_value, unit, color, icon) VALUES
    (NEW.id, 'Beber agua', 'Beber 8 vasos de agua al día', 'daily', 8, 'vasos', '#3b82f6', '💧'),
    (NEW.id, 'Ejercicio', 'Hacer ejercicio o caminar', 'daily', 1, NULL, '#10b981', '💪');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ¡LISTO! Ahora puedes registrarte en la app
-- =============================================
