-- Historial de alimentos usados (para sugerencias)
CREATE TABLE user_food_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories_per_100g NUMERIC(8,2),
  protein_per_100g NUMERIC(8,2),
  carbs_per_100g NUMERIC(8,2),
  fat_per_100g NUMERIC(8,2),
  default_quantity NUMERIC(8,2) DEFAULT 100,
  default_unit TEXT DEFAULT 'g',
  use_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, food_name)
);

-- Comidas favoritas (combinaciones guardadas)
CREATE TABLE favorite_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  items JSONB NOT NULL, -- Array de {food_name, quantity, unit, macros}
  total_calories NUMERIC(8,2),
  total_protein NUMERIC(8,2),
  total_carbs NUMERIC(8,2),
  total_fat NUMERIC(8,2),
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_history_user ON user_food_history(user_id, use_count DESC);
CREATE INDEX idx_favorite_meals_user ON favorite_meals(user_id);

ALTER TABLE user_food_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own food history" ON user_food_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own favorite meals" ON favorite_meals FOR ALL USING (auth.uid() = user_id);