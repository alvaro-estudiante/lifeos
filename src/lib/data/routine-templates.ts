export interface RoutineTemplate {
  id: string;
  name: string;
  description: string;
  type: 'strength' | 'hypertrophy' | 'endurance' | 'mixed';
  days_per_week: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'full_body' | 'upper_lower' | 'push_pull_legs' | 'bro_split' | 'other';
  exercises: {
    exercise_name: string;
    muscle_group: string;
    sets: number;
    reps_min: number;
    reps_max: number;
    rest_seconds: number;
    day?: number; // Para rutinas multi-día
    notes?: string;
  }[];
}

export const routineTemplates: RoutineTemplate[] = [
  // === PRINCIPIANTE ===
  {
    id: 'full-body-beginner',
    name: 'Full Body Principiante',
    description: 'Rutina ideal para empezar. 3 días por semana, trabaja todo el cuerpo.',
    type: 'hypertrophy',
    days_per_week: 3,
    level: 'beginner',
    category: 'full_body',
    exercises: [
      { exercise_name: 'Sentadilla', muscle_group: 'quadriceps', sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 90 },
      { exercise_name: 'Press de banca', muscle_group: 'chest', sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 90 },
      { exercise_name: 'Remo con barra', muscle_group: 'back', sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 90 },
      { exercise_name: 'Press militar', muscle_group: 'shoulders', sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 90 },
      { exercise_name: 'Curl de bíceps con barra', muscle_group: 'biceps', sets: 2, reps_min: 10, reps_max: 15, rest_seconds: 60 },
      { exercise_name: 'Extensiones de tríceps en polea', muscle_group: 'triceps', sets: 2, reps_min: 10, reps_max: 15, rest_seconds: 60 },
      { exercise_name: 'Plancha', muscle_group: 'core', sets: 3, reps_min: 30, reps_max: 60, rest_seconds: 60, notes: 'Segundos' },
    ]
  },
  
  // === PUSH PULL LEGS ===
  {
    id: 'ppl-intermediate',
    name: 'Push Pull Legs',
    description: 'Clásica rutina PPL. 6 días por semana, alta frecuencia.',
    type: 'hypertrophy',
    days_per_week: 6,
    level: 'intermediate',
    category: 'push_pull_legs',
    exercises: [
      // PUSH (Día 1 y 4)
      { exercise_name: 'Press de banca', muscle_group: 'chest', sets: 4, reps_min: 6, reps_max: 10, rest_seconds: 120, day: 1 },
      { exercise_name: 'Press inclinado con mancuernas', muscle_group: 'chest', sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 90, day: 1 },
      { exercise_name: 'Press militar', muscle_group: 'shoulders', sets: 4, reps_min: 8, reps_max: 12, rest_seconds: 90, day: 1 },
      { exercise_name: 'Elevaciones laterales', muscle_group: 'shoulders', sets: 3, reps_min: 12, reps_max: 15, rest_seconds: 60, day: 1 },
      { exercise_name: 'Extensiones de tríceps en polea', muscle_group: 'triceps', sets: 3, reps_min: 10, reps_max: 15, rest_seconds: 60, day: 1 },
      { exercise_name: 'Fondos en paralelas', muscle_group: 'triceps', sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 90, day: 1 },
      
      // PULL (Día 2 y 5)
      { exercise_name: 'Dominadas', muscle_group: 'back', sets: 4, reps_min: 6, reps_max: 10, rest_seconds: 120, day: 2 },
      { exercise_name: 'Remo con barra', muscle_group: 'back', sets: 4, reps_min: 8, reps_max: 12, rest_seconds: 90, day: 2 },
      { exercise_name: 'Jalón al pecho', muscle_group: 'back', sets: 3, reps_min: 10, reps_max: 12, rest_seconds: 90, day: 2 },
      { exercise_name: 'Remo en polea baja', muscle_group: 'back', sets: 3, reps_min: 10, reps_max: 12, rest_seconds: 90, day: 2 },
      { exercise_name: 'Curl de bíceps con barra', muscle_group: 'biceps', sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 60, day: 2 },
      { exercise_name: 'Curl martillo', muscle_group: 'biceps', sets: 3, reps_min: 10, reps_max: 15, rest_seconds: 60, day: 2 },
      
      // LEGS (Día 3 y 6)
      { exercise_name: 'Sentadilla', muscle_group: 'quadriceps', sets: 4, reps_min: 6, reps_max: 10, rest_seconds: 180, day: 3 },
      { exercise_name: 'Peso muerto rumano', muscle_group: 'hamstrings', sets: 4, reps_min: 8, reps_max: 12, rest_seconds: 120, day: 3 },
      { exercise_name: 'Prensa de piernas', muscle_group: 'quadriceps', sets: 3, reps_min: 10, reps_max: 15, rest_seconds: 90, day: 3 },
      { exercise_name: 'Curl femoral', muscle_group: 'hamstrings', sets: 3, reps_min: 10, reps_max: 15, rest_seconds: 90, day: 3 },
      { exercise_name: 'Hip thrust', muscle_group: 'glutes', sets: 3, reps_min: 10, reps_max: 15, rest_seconds: 90, day: 3 },
      { exercise_name: 'Elevación de gemelos de pie', muscle_group: 'calves', sets: 4, reps_min: 12, reps_max: 20, rest_seconds: 60, day: 3 },
    ]
  },
  
  // === UPPER LOWER ===
  {
    id: 'upper-lower-4day',
    name: 'Upper/Lower 4 días',
    description: 'Divide el cuerpo en tren superior e inferior. Equilibrado y efectivo.',
    type: 'hypertrophy',
    days_per_week: 4,
    level: 'intermediate',
    category: 'upper_lower',
    exercises: [
      // UPPER A (Día 1)
      { exercise_name: 'Press de banca', muscle_group: 'chest', sets: 4, reps_min: 6, reps_max: 10, rest_seconds: 120, day: 1 },
      { exercise_name: 'Remo con barra', muscle_group: 'back', sets: 4, reps_min: 6, reps_max: 10, rest_seconds: 120, day: 1 },
      { exercise_name: 'Press militar', muscle_group: 'shoulders', sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 90, day: 1 },
      { exercise_name: 'Jalón al pecho', muscle_group: 'back', sets: 3, reps_min: 10, reps_max: 12, rest_seconds: 90, day: 1 },
      { exercise_name: 'Curl de bíceps con barra', muscle_group: 'biceps', sets: 3, reps_min: 10, reps_max: 12, rest_seconds: 60, day: 1 },
      { exercise_name: 'Extensiones de tríceps en polea', muscle_group: 'triceps', sets: 3, reps_min: 10, reps_max: 12, rest_seconds: 60, day: 1 },
      
      // LOWER A (Día 2)
      { exercise_name: 'Sentadilla', muscle_group: 'quadriceps', sets: 4, reps_min: 6, reps_max: 10, rest_seconds: 180, day: 2 },
      { exercise_name: 'Peso muerto rumano', muscle_group: 'hamstrings', sets: 4, reps_min: 8, reps_max: 12, rest_seconds: 120, day: 2 },
      { exercise_name: 'Zancadas', muscle_group: 'quadriceps', sets: 3, reps_min: 10, reps_max: 12, rest_seconds: 90, day: 2 },
      { exercise_name: 'Curl femoral', muscle_group: 'hamstrings', sets: 3, reps_min: 10, reps_max: 15, rest_seconds: 90, day: 2 },
      { exercise_name: 'Elevación de gemelos de pie', muscle_group: 'calves', sets: 4, reps_min: 12, reps_max: 20, rest_seconds: 60, day: 2 },
      { exercise_name: 'Plancha', muscle_group: 'core', sets: 3, reps_min: 45, reps_max: 60, rest_seconds: 60, day: 2, notes: 'Segundos' },
      
      // UPPER B (Día 3)
      { exercise_name: 'Press inclinado con mancuernas', muscle_group: 'chest', sets: 4, reps_min: 8, reps_max: 12, rest_seconds: 90, day: 3 },
      { exercise_name: 'Dominadas', muscle_group: 'back', sets: 4, reps_min: 6, reps_max: 10, rest_seconds: 120, day: 3 },
      { exercise_name: 'Aperturas con mancuernas', muscle_group: 'chest', sets: 3, reps_min: 10, reps_max: 15, rest_seconds: 60, day: 3 },
      { exercise_name: 'Remo con mancuerna', muscle_group: 'back', sets: 3, reps_min: 10, reps_max: 12, rest_seconds: 90, day: 3 },
      { exercise_name: 'Elevaciones laterales', muscle_group: 'shoulders', sets: 4, reps_min: 12, reps_max: 15, rest_seconds: 60, day: 3 },
      { exercise_name: 'Curl martillo', muscle_group: 'biceps', sets: 3, reps_min: 10, reps_max: 12, rest_seconds: 60, day: 3 },
      
      // LOWER B (Día 4)
      { exercise_name: 'Peso muerto', muscle_group: 'back', sets: 4, reps_min: 5, reps_max: 8, rest_seconds: 180, day: 4 },
      { exercise_name: 'Prensa de piernas', muscle_group: 'quadriceps', sets: 4, reps_min: 10, reps_max: 15, rest_seconds: 90, day: 4 },
      { exercise_name: 'Hip thrust', muscle_group: 'glutes', sets: 4, reps_min: 10, reps_max: 15, rest_seconds: 90, day: 4 },
      { exercise_name: 'Extensiones de cuádriceps', muscle_group: 'quadriceps', sets: 3, reps_min: 12, reps_max: 15, rest_seconds: 60, day: 4 },
      { exercise_name: 'Elevación de gemelos sentado', muscle_group: 'calves', sets: 4, reps_min: 15, reps_max: 20, rest_seconds: 60, day: 4 },
      { exercise_name: 'Crunch', muscle_group: 'core', sets: 3, reps_min: 15, reps_max: 20, rest_seconds: 60, day: 4 },
    ]
  },
  
  // === FUERZA ===
  {
    id: 'strength-5x5',
    name: 'Fuerza 5x5',
    description: 'Programa clásico de fuerza. Enfocado en los movimientos compuestos principales.',
    type: 'strength',
    days_per_week: 3,
    level: 'beginner',
    category: 'full_body',
    exercises: [
      // Día A
      { exercise_name: 'Sentadilla', muscle_group: 'quadriceps', sets: 5, reps_min: 5, reps_max: 5, rest_seconds: 180, day: 1 },
      { exercise_name: 'Press de banca', muscle_group: 'chest', sets: 5, reps_min: 5, reps_max: 5, rest_seconds: 180, day: 1 },
      { exercise_name: 'Remo con barra', muscle_group: 'back', sets: 5, reps_min: 5, reps_max: 5, rest_seconds: 180, day: 1 },
      
      // Día B
      { exercise_name: 'Sentadilla', muscle_group: 'quadriceps', sets: 5, reps_min: 5, reps_max: 5, rest_seconds: 180, day: 2 },
      { exercise_name: 'Press militar', muscle_group: 'shoulders', sets: 5, reps_min: 5, reps_max: 5, rest_seconds: 180, day: 2 },
      { exercise_name: 'Peso muerto', muscle_group: 'back', sets: 1, reps_min: 5, reps_max: 5, rest_seconds: 180, day: 2 },
    ]
  },
  
  // === MINIMALISTA ===
  {
    id: 'minimalist-2day',
    name: 'Minimalista 2 días',
    description: 'Para quienes tienen poco tiempo. Lo esencial en 2 días.',
    type: 'mixed',
    days_per_week: 2,
    level: 'beginner',
    category: 'full_body',
    exercises: [
      { exercise_name: 'Sentadilla', muscle_group: 'quadriceps', sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 120 },
      { exercise_name: 'Press de banca', muscle_group: 'chest', sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 90 },
      { exercise_name: 'Dominadas', muscle_group: 'back', sets: 3, reps_min: 6, reps_max: 10, rest_seconds: 90 },
      { exercise_name: 'Press militar', muscle_group: 'shoulders', sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 90 },
      { exercise_name: 'Peso muerto rumano', muscle_group: 'hamstrings', sets: 3, reps_min: 8, reps_max: 12, rest_seconds: 120 },
    ]
  },
];

export function getTemplatesByLevel(level: 'beginner' | 'intermediate' | 'advanced') {
  return routineTemplates.filter(t => t.level === level);
}

export function getTemplatesByCategory(category: string) {
  return routineTemplates.filter(t => t.category === category);
}