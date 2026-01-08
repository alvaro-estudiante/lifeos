# LifeOS - Product Requirements Document (PRD)

## 📋 Información General

| Campo | Valor |
|-------|-------|
| **Nombre del proyecto** | LifeOS |
| **Tipo** | Aplicación web PWA de organización personal |
| **Usuario objetivo** | Uso personal (single user) |
| **Desarrollador** | Xaxe Juanja (Flama Studio) |
| **Fecha inicio** | Enero 2025 |
| **Estado** | En desarrollo |

---

## 🎯 Visión del Producto

LifeOS es una aplicación integral de organización personal que unifica nutrición, fitness, productividad y gestión de ideas en una única plataforma potenciada por inteligencia artificial. Funciona como un nutricionista, entrenador personal y asistente de productividad altamente personalizado.

### Principios de diseño
- **IA-first**: La inteligencia artificial es el núcleo de todas las funcionalidades
- **Minimalismo funcional**: Interfaz limpia, solo lo necesario
- **Velocidad**: Registro rápido, mínima fricción
- **Offline-ready**: PWA con funcionamiento sin conexión
- **Coste-eficiente**: Optimización de llamadas a API

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Gráficas**: Recharts
- **PWA**: next-pwa
- **Estado**: Zustand (si es necesario)
- **Formularios**: React Hook Form + Zod

### Backend
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage (imágenes)
- **Realtime**: Supabase Realtime (opcional)

### Inteligencia Artificial
- **Modelo principal**: Gemini 2.5 Pro (consultas complejas)
- **Modelo secundario**: Gemini 2.5 Flash (tareas simples, transcripción)
- **Proveedor**: Google AI Studio API

### Integraciones
- **Bot**: Telegram Bot API
- **Automatizaciones**: n8n (self-hosted o cloud)
- **Base de alimentos**: Open Food Facts API (gratis)

### Infraestructura
- **Hosting**: Vercel (free tier)
- **Dominio**: Opcional (Vercel subdomain gratuito)

---

## 🗄️ Arquitectura de Base de Datos

### Esquema completo (Supabase/PostgreSQL)

```sql
-- =============================================
-- USUARIOS Y PERFILES
-- =============================================

-- Perfiles de usuario (extiende auth.users de Supabase)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm NUMERIC(5,2),
  current_weight_kg NUMERIC(5,2),
  target_weight_kg NUMERIC(5,2),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  fitness_goal TEXT CHECK (fitness_goal IN ('lose_fat', 'maintain', 'build_muscle', 'recomposition', 'health')),
  dietary_restrictions TEXT[], -- ['vegetarian', 'gluten_free', etc.]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historial de peso
CREATE TABLE weight_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5,2) NOT NULL,
  body_fat_percentage NUMERIC(4,1),
  muscle_mass_kg NUMERIC(5,2),
  notes TEXT,
  recorded_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MÓDULO DE NUTRICIÓN
-- =============================================

-- Objetivos nutricionales
CREATE TABLE nutrition_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calories_target INTEGER,
  protein_g INTEGER,
  carbs_g INTEGER,
  fat_g INTEGER,
  fiber_g INTEGER,
  water_ml INTEGER DEFAULT 2000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Despensa (alimentos disponibles)
CREATE TABLE pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('proteins', 'carbs', 'vegetables', 'fruits', 'dairy', 'fats', 'condiments', 'beverages', 'other')),
  quantity NUMERIC(10,2),
  unit TEXT CHECK (unit IN ('g', 'kg', 'ml', 'l', 'units', 'pack')),
  calories_per_100g NUMERIC(6,2),
  protein_per_100g NUMERIC(5,2),
  carbs_per_100g NUMERIC(5,2),
  fat_per_100g NUMERIC(5,2),
  fiber_per_100g NUMERIC(5,2),
  expiry_date DATE,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipamiento de cocina
CREATE TABLE kitchen_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('appliance', 'cookware', 'utensil', 'other')),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recetas guardadas
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER DEFAULT 1,
  total_calories NUMERIC(8,2),
  total_protein NUMERIC(6,2),
  total_carbs NUMERIC(6,2),
  total_fat NUMERIC(6,2),
  total_fiber NUMERIC(6,2),
  ingredients JSONB, -- [{name, quantity, unit, calories, protein, carbs, fat}]
  equipment_needed TEXT[],
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comidas registradas
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_date DATE DEFAULT CURRENT_DATE,
  meal_time TIME,
  total_calories NUMERIC(8,2),
  total_protein NUMERIC(6,2),
  total_carbs NUMERIC(6,2),
  total_fat NUMERIC(6,2),
  total_fiber NUMERIC(6,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items de cada comida
CREATE TABLE meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT DEFAULT 'g',
  calories NUMERIC(8,2),
  protein NUMERIC(6,2),
  carbs NUMERIC(6,2),
  fat NUMERIC(6,2),
  fiber NUMERIC(6,2),
  from_pantry_id UUID REFERENCES pantry_items(id) ON DELETE SET NULL,
  from_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registro de agua
CREATE TABLE water_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  intake_date DATE DEFAULT CURRENT_DATE,
  intake_time TIME DEFAULT CURRENT_TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MÓDULO DE FITNESS
-- =============================================

-- Catálogo de ejercicios
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_group TEXT CHECK (muscle_group IN ('chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'core', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'full_body', 'cardio')),
  equipment TEXT,
  instructions TEXT,
  video_url TEXT,
  is_compound BOOLEAN DEFAULT false,
  is_custom BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rutinas de entrenamiento
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('strength', 'hypertrophy', 'endurance', 'cardio', 'mixed', 'custom')),
  days_per_week INTEGER,
  exercises JSONB, -- [{exercise_id, sets, reps_min, reps_max, rest_seconds, notes}]
  is_active BOOLEAN DEFAULT true,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entrenamientos realizados
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
  name TEXT,
  workout_date DATE DEFAULT CURRENT_DATE,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER,
  total_volume NUMERIC(10,2), -- peso total levantado
  notes TEXT,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  overall_feeling INTEGER CHECK (overall_feeling BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ejercicios de cada entrenamiento
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  exercise_name TEXT NOT NULL, -- denormalizado por si se borra el ejercicio
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Series de cada ejercicio
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg NUMERIC(6,2),
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10), -- Rating of Perceived Exertion
  is_warmup BOOLEAN DEFAULT false,
  is_dropset BOOLEAN DEFAULT false,
  is_failure BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MÓDULO DE PRODUCTIVIDAD
-- =============================================

-- Tareas
CREATE TABLE tasks (
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
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- subtareas
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hábitos
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'custom')) DEFAULT 'daily',
  frequency_config JSONB, -- para custom: {days: ['mon', 'wed', 'fri']}
  target_value INTEGER DEFAULT 1, -- ej: 8 vasos de agua
  unit TEXT, -- ej: 'vasos', 'minutos'
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registro de hábitos
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE DEFAULT CURRENT_DATE,
  value INTEGER DEFAULT 1, -- veces completado
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registro de sueño
CREATE TABLE sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_date DATE DEFAULT CURRENT_DATE,
  bed_time TIME,
  wake_time TIME,
  duration_hours NUMERIC(4,2),
  quality INTEGER CHECK (quality BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MÓDULO DE NOTAS
-- =============================================

-- Carpetas/Categorías de notas
CREATE TABLE note_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  icon TEXT,
  parent_folder_id UUID REFERENCES note_folders(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notas
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES note_folders(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT,
  content_html TEXT, -- si usamos editor rich text
  type TEXT CHECK (type IN ('note', 'idea', 'journal', 'reference')) DEFAULT 'note',
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SISTEMA DE IA
-- =============================================

-- Logs de conversaciones con IA (para contexto)
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT CHECK (module IN ('nutrition', 'fitness', 'productivity', 'notes', 'general')),
  messages JSONB, -- [{role: 'user'|'assistant', content: '...', timestamp: '...'}]
  tokens_used INTEGER,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Caché de respuestas IA (para optimizar costes)
CREATE TABLE ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL, -- hash del prompt
  response JSONB NOT NULL,
  module TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA RENDIMIENTO
-- =============================================

CREATE INDEX idx_pantry_user ON pantry_items(user_id);
CREATE INDEX idx_pantry_available ON pantry_items(user_id, is_available);
CREATE INDEX idx_meals_user_date ON meals(user_id, meal_date);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, workout_date);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_due ON tasks(user_id, due_date);
CREATE INDEX idx_habits_user_active ON habits(user_id, is_active);
CREATE INDEX idx_habit_logs_date ON habit_logs(habit_id, log_date);
CREATE INDEX idx_notes_user_folder ON notes(user_id, folder_id);
CREATE INDEX idx_ai_cache_key ON ai_cache(cache_key);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (ejemplo para todas las tablas)
-- El usuario solo puede ver/modificar sus propios datos

CREATE POLICY "Users can manage own profile"
  ON user_profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Users can manage own weight history"
  ON weight_history FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own nutrition goals"
  ON nutrition_goals FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own pantry"
  ON pantry_items FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own kitchen equipment"
  ON kitchen_equipment FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own recipes"
  ON recipes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own meals"
  ON meals FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own meal items"
  ON meal_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_items.meal_id
      AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own water intake"
  ON water_intake FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own exercises"
  ON exercises FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own routines"
  ON routines FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own workouts"
  ON workouts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own workout exercises"
  ON workout_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own workout sets"
  ON workout_sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workout_exercises
      JOIN workouts ON workouts.id = workout_exercises.workout_id
      WHERE workout_exercises.id = workout_sets.workout_exercise_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own habits"
  ON habits FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own habit logs"
  ON habit_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own sleep logs"
  ON sleep_logs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own note folders"
  ON note_folders FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notes"
  ON notes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI conversations"
  ON ai_conversations FOR ALL
  USING (auth.uid() = user_id);
```

---

## 📱 Estructura de la Aplicación

### Páginas principales

```
/                       → Dashboard principal
/auth/login             → Login
/auth/register          → Registro
/onboarding             → Configuración inicial

/nutrition              → Dashboard nutrición
/nutrition/meals        → Registro de comidas
/nutrition/pantry       → Gestión de despensa
/nutrition/recipes      → Recetas guardadas
/nutrition/recipes/new  → Generar receta con IA
/nutrition/goals        → Objetivos nutricionales
/nutrition/analysis     → Análisis y estadísticas

/fitness                → Dashboard fitness
/fitness/workout        → Registrar entrenamiento
/fitness/routines       → Mis rutinas
/fitness/routines/new   → Crear/generar rutina
/fitness/exercises      → Catálogo de ejercicios
/fitness/progress       → Análisis de progreso

/tasks                  → Lista de tareas
/tasks/today            → Vista día (timeline)
/habits                 → Gestión de hábitos

/notes                  → Lista de notas
/notes/[id]             → Ver/editar nota
/notes/new              → Nueva nota

/settings               → Configuración
/settings/profile       → Perfil y objetivos
/settings/equipment     → Equipamiento cocina
```

### Componentes principales

```
components/
├── layout/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── BottomNav.tsx (mobile)
│   └── MainLayout.tsx
├── ui/ (shadcn)
│   └── ... (button, card, input, etc.)
├── nutrition/
│   ├── MealCard.tsx
│   ├── FoodSearch.tsx
│   ├── MacroRing.tsx
│   ├── PantryItem.tsx
│   ├── RecipeCard.tsx
│   └── NutritionDashboard.tsx
├── fitness/
│   ├── WorkoutCard.tsx
│   ├── ExerciseSelector.tsx
│   ├── SetInput.tsx
│   ├── ProgressChart.tsx
│   └── RoutineBuilder.tsx
├── productivity/
│   ├── TaskItem.tsx
│   ├── TaskList.tsx
│   ├── DayTimeline.tsx
│   ├── HabitTracker.tsx
│   └── HabitCard.tsx
├── notes/
│   ├── NoteCard.tsx
│   ├── NoteEditor.tsx
│   └── FolderTree.tsx
├── ai/
│   ├── AIChatBox.tsx
│   ├── AIRecipeGenerator.tsx
│   ├── AIAnalysis.tsx
│   └── VoiceInput.tsx
└── common/
    ├── LoadingSpinner.tsx
    ├── EmptyState.tsx
    ├── ConfirmDialog.tsx
    └── DatePicker.tsx
```

---

## 🤖 Prompts de IA

### System Prompt: Nutricionista IA

```
Eres NutriOS, el asistente de nutrición integrado en LifeOS. Tu rol es actuar como un nutricionista personal experto.

CONTEXTO DEL USUARIO:
- Nombre: {user_name}
- Objetivos: {fitness_goal}
- Peso actual: {current_weight} kg
- Peso objetivo: {target_weight} kg
- Nivel de actividad: {activity_level}
- Restricciones dietéticas: {dietary_restrictions}
- Calorías objetivo: {calories_target} kcal
- Macros objetivo: {protein_g}g proteína, {carbs_g}g carbos, {fat_g}g grasa

ALIMENTOS DISPONIBLES EN DESPENSA:
{pantry_items}

EQUIPAMIENTO DE COCINA:
{kitchen_equipment}

INSTRUCCIONES:
1. Siempre responde en español
2. Sé conciso pero útil
3. Prioriza los alimentos disponibles en la despensa
4. Considera el equipamiento disponible
5. Ajusta las recetas a los objetivos del usuario
6. Incluye información nutricional aproximada
7. Si te piden una receta, responde SIEMPRE en formato JSON estructurado

FORMATO RESPUESTA RECETA (JSON):
{
  "name": "Nombre de la receta",
  "description": "Descripción breve",
  "prep_time_minutes": 10,
  "cook_time_minutes": 20,
  "servings": 2,
  "ingredients": [
    {"name": "Ingrediente", "quantity": 100, "unit": "g"}
  ],
  "instructions": ["Paso 1", "Paso 2"],
  "equipment_needed": ["sartén", "horno"],
  "nutrition_per_serving": {
    "calories": 450,
    "protein": 35,
    "carbs": 40,
    "fat": 15,
    "fiber": 5
  },
  "tags": ["alta proteína", "rápido", "bajo carbohidrato"]
}
```

### System Prompt: Entrenador IA

```
Eres FitOS, el asistente de entrenamiento integrado en LifeOS. Tu rol es actuar como un entrenador personal experto.

CONTEXTO DEL USUARIO:
- Nombre: {user_name}
- Objetivo: {fitness_goal}
- Experiencia: {training_experience}
- Días disponibles: {days_per_week}
- Equipamiento disponible: {available_equipment}

HISTORIAL RECIENTE:
{recent_workouts}

PROGRESO DE FUERZA:
{strength_progress}

INSTRUCCIONES:
1. Siempre responde en español
2. Prioriza la técnica y seguridad
3. Ajusta las recomendaciones al nivel del usuario
4. Considera la fatiga acumulada
5. Sugiere progresiones realistas
6. Detecta posibles estancamientos

PARA CREAR RUTINAS (JSON):
{
  "name": "Nombre de la rutina",
  "type": "hypertrophy",
  "days_per_week": 4,
  "description": "Descripción",
  "exercises": [
    {
      "exercise_name": "Press de banca",
      "muscle_group": "chest",
      "sets": 4,
      "reps_min": 8,
      "reps_max": 12,
      "rest_seconds": 90,
      "notes": "Controla la bajada"
    }
  ]
}
```

### System Prompt: Asistente de Notas

```
Eres NotesOS, el asistente de notas integrado en LifeOS.

CAPACIDADES:
1. Mejorar redacción manteniendo el estilo del usuario
2. Resumir textos largos
3. Reestructurar contenido
4. Extraer puntos clave
5. Convertir notas en formato específico (lista, outline, párrafos)

INSTRUCCIONES:
1. Siempre responde en español (salvo que la nota esté en otro idioma)
2. Mantén la esencia y tono del contenido original
3. Sé conciso en las respuestas
4. Para mejoras de redacción, explica brevemente los cambios
```

---

## 🚀 Fases de Desarrollo

### Fase 0: Setup Base (2-3 días)
**Objetivo**: Proyecto funcional desplegado

**Tareas**:
- [ ] Crear proyecto Next.js 14 con TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Instalar y configurar shadcn/ui
- [ ] Crear proyecto en Supabase
- [ ] Configurar variables de entorno
- [ ] Implementar autenticación (login/registro)
- [ ] Crear layout principal (sidebar + header)
- [ ] Configurar PWA (next-pwa)
- [ ] Primer deploy en Vercel
- [ ] Ejecutar schema SQL en Supabase

**Entregables**:
- App funcionando en Vercel
- Login/registro operativo
- Navegación básica

---

### Fase 1: MVP Nutrición (1-2 semanas)
**Objetivo**: Registro de comidas y despensa funcional

**Tareas**:
- [ ] CRUD completo de despensa
- [ ] CRUD de equipamiento de cocina
- [ ] Formulario de objetivos nutricionales
- [ ] Registro de comidas manual
- [ ] Búsqueda de alimentos (Open Food Facts API)
- [ ] Cálculo automático de macros
- [ ] Dashboard diario de nutrición
- [ ] Gráfica de macros (ring chart)
- [ ] Integración IA: generar recetas
- [ ] CRUD de recetas guardadas
- [ ] Registro de agua

**Entregables**:
- Poder registrar todo lo que como
- Ver macros del día
- Generar recetas con IA basadas en despensa

---

### Fase 2: MVP Fitness (1-2 semanas)
**Objetivo**: Registro de entrenamientos funcional

**Tareas**:
- [ ] Catálogo de ejercicios (con ejercicios predefinidos)
- [ ] CRUD de ejercicios personalizados
- [ ] CRUD de rutinas
- [ ] Registro de entrenamientos
- [ ] Input de series (peso, reps, RPE)
- [ ] Timer de descanso
- [ ] Historial de entrenamientos
- [ ] Gráficas de progreso básicas
- [ ] Integración IA: generar rutinas
- [ ] Integración IA: análisis de progreso

**Entregables**:
- Poder registrar cada entreno
- Ver historial y progreso
- Generar rutinas con IA

---

### Fase 3: Productividad (1 semana)
**Objetivo**: Sistema de tareas y hábitos

**Tareas**:
- [ ] CRUD de tareas
- [ ] Vista lista con filtros
- [ ] Vista timeline/calendario diario
- [ ] Sistema de prioridades
- [ ] Subtareas
- [ ] CRUD de hábitos
- [ ] Tracking diario de hábitos
- [ ] Visualización de rachas
- [ ] Registro de sueño (simple)

**Entregables**:
- To-do list funcional
- Tracker de hábitos
- Vista visual del día

---

### Fase 4: Notas con IA (3-5 días)
**Objetivo**: Sistema de notas inteligente

**Tareas**:
- [ ] CRUD de carpetas
- [ ] CRUD de notas
- [ ] Editor de texto (básico o rich text)
- [ ] Sistema de tags
- [ ] Búsqueda de notas
- [ ] IA: mejorar redacción
- [ ] IA: resumir
- [ ] IA: reestructurar

**Entregables**:
- Sistema de notas organizado
- Capacidad de mejorar notas con IA

---

### Fase 5: Bot Telegram (3-5 días)
**Objetivo**: Input por voz desde Telegram

**Tareas**:
- [ ] Crear bot en Telegram
- [ ] Configurar webhook (n8n o directo)
- [ ] Recibir y transcribir audios (Gemini Flash)
- [ ] Interpretar contenido con IA
- [ ] Clasificar: nutrición, nota o tarea
- [ ] Guardar automáticamente en Supabase
- [ ] Comandos rápidos (/comida, /nota, /tarea, /entreno)
- [ ] Confirmación al usuario

**Entregables**:
- Poder enviar audio y que se registre automáticamente
- Comandos para registro rápido

---

### Fase 6: IA Avanzada y Pulido (ongoing)
**Objetivo**: Inteligencia y análisis profundo

**Tareas**:
- [ ] Análisis semanal de nutrición
- [ ] Análisis mensual de nutrición
- [ ] Recomendaciones de ajuste nutricional
- [ ] Detección de estancamientos en entreno
- [ ] Sugerencias de deload
- [ ] Correlaciones (sueño vs rendimiento)
- [ ] Meal prep semanal con lista de compra
- [ ] Onboarding inteligente
- [ ] Foto → identificar alimento
- [ ] Widgets de resumen en dashboard
- [ ] Gamificación (rachas, logros)
- [ ] Modo oscuro
- [ ] Exportar datos

**Entregables**:
- App pulida y completa
- Análisis inteligente real

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Registro diario de comidas | >90% de días |
| Registro de entrenamientos | 100% de sesiones |
| Tiempo para registrar comida | <30 segundos |
| Precisión estimación macros | >85% |
| Uso del bot Telegram | >50% de registros |
| Coste mensual API | <15€ |

---

## 🔧 Configuración de Desarrollo

### Variables de Entorno (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhxxxxxxx

# Gemini AI
GEMINI_API_KEY=AIzaxxxxxxx

# Telegram Bot (para fase 5)
TELEGRAM_BOT_TOKEN=123456:ABCxxxxxxx

# Open Food Facts (no requiere key)
OPENFOODFACTS_API_URL=https://world.openfoodfacts.org/api/v0
```

### Scripts package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts"
  }
}
```

---

## 📝 Notas para el Desarrollo

### Prioridades de UX
1. **Velocidad ante todo**: El registro debe ser rápido
2. **Mobile-first**: Diseñar primero para móvil
3. **Feedback inmediato**: Loaders, confirmaciones
4. **Offline-capable**: Guardar en local si no hay conexión

### Optimización de Costes IA
1. **Cachear respuestas** de recetas similares
2. **Usar Flash** para tareas simples (transcripción, clasificación)
3. **Usar Pro** solo para generación y análisis complejos
4. **Batch requests** cuando sea posible
5. **Limitar tokens** de respuesta cuando no es necesario texto largo

### Seguridad
1. **Nunca exponer** SUPABASE_SERVICE_ROLE_KEY en cliente
2. **RLS activo** en todas las tablas
3. **Validar** inputs en servidor
4. **Sanitizar** contenido generado por IA

---

## 🎨 Guía de Diseño

### Colores principales
```css
--primary: #3B82F6 (blue-500)
--secondary: #10B981 (emerald-500)
--accent: #F59E0B (amber-500)
--background: #FFFFFF / #0F172A (dark)
--foreground: #1E293B / #F8FAFC (dark)
```

### Tipografía
- **Font**: Inter (Google Fonts)
- **Headings**: Font-semibold
- **Body**: Font-normal

### Espaciado
- Seguir escala de Tailwind
- Padding cards: p-4 (mobile) / p-6 (desktop)
- Gap entre elementos: gap-4

---

## ✅ Checklist Pre-desarrollo

- [ ] Cuenta de Supabase creada
- [ ] Proyecto Supabase iniciado
- [ ] API key de Gemini configurada
- [ ] Vercel account lista
- [ ] Repositorio Git creado
- [ ] VS Code + Kilo Code configurado
- [ ] Este PRD guardado como referencia

---

**Documento creado**: Enero 2025
**Última actualización**: Enero 2025
**Versión**: 1.0
