'use server';

import { getSessionOrThrow } from '@/lib/auth/session';
import { getDailySummary } from './nutrition-summary';
import { getTasksForDate } from './tasks';
import { getHabits, getHabitLogsForDate } from './habits';
import { getActiveWorkout, getWorkoutHistory } from './workouts';
import { getSleepLog } from './sleep';
import { getBudgets } from './finance';
import { Suggestion } from '@/components/dashboard/SmartSuggestions';

export async function getDailySuggestions(userId: string): Promise<Suggestion[]> {
  // Ensure session is valid
  await getSessionOrThrow();
  
  const today = new Date().toISOString().split('T')[0];
  
  const [
    nutritionStatus,
    todayTasks,
    habits,
    habitLogs,
    activeWorkout,
    lastWorkouts,
    sleepLog,
    budgets
  ] = await Promise.all([
    getDailySummary(today).catch(() => ({ consumed: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }, goals: null })),
    getTasksForDate(today).catch(() => []),
    getHabits(true).catch(() => []),
    getHabitLogsForDate(today).catch(() => []),
    getActiveWorkout().catch(() => null),
    getWorkoutHistory(1).catch(() => []),
    getSleepLog(today).catch(() => null),
    getBudgets().catch(() => [])
  ]);

  const suggestions: Suggestion[] = [];

  // 1. Nutrición: Falta de calorías
  const caloriesLeft = (nutritionStatus.goals?.calories_target || 2000) - nutritionStatus.consumed.calories;
  if (caloriesLeft > 500 && new Date().getHours() > 18) {
    suggestions.push({
      id: 'nutrition-deficit',
      type: 'nutrition',
      priority: 'high',
      title: 'Déficit calórico alto',
      description: `Te faltan ${Math.round(caloriesLeft)} kcal para tu objetivo.`,
      action: { label: 'Registrar cena', href: '/nutrition/meals' }
    });
  }

  // 2. Fitness: No has entrenado
  const lastWorkout = lastWorkouts[0];
  const daysSinceWorkout = lastWorkout 
    ? Math.floor((new Date().getTime() - new Date(lastWorkout.workout_date).getTime()) / (1000 * 3600 * 24))
    : 100;

  if (!activeWorkout && daysSinceWorkout >= 2) {
    suggestions.push({
      id: 'fitness-inactive',
      type: 'fitness',
      priority: 'high',
      title: '¡A moverse!',
      description: `Hace ${daysSinceWorkout} días que no registras un entreno.`,
      action: { label: 'Empezar rutina', href: '/fitness/routines' }
    });
  } else if (activeWorkout) {
    suggestions.push({
      id: 'fitness-active',
      type: 'fitness',
      priority: 'high',
      title: 'Entrenamiento en curso',
      description: `Tienes un entrenamiento activo: ${activeWorkout.name || 'Sin nombre'}`,
      action: { label: 'Continuar', href: '/fitness/workout' }
    });
  }

  // 3. Tareas pendientes
  const pendingTasks = todayTasks.filter(t => t.status === 'pending');
  if (pendingTasks.length > 0) {
    suggestions.push({
      id: 'tasks-pending',
      type: 'task',
      priority: pendingTasks.some(t => t.priority === 'urgent' || t.priority === 'high') ? 'high' : 'medium',
      title: `${pendingTasks.length} tareas pendientes`,
      description: `Tienes ${pendingTasks.length} tareas para hoy.`,
      action: { label: 'Ver tareas', href: '/tasks' }
    });
  }

  // 4. Hábitos
  const completedHabits = habitLogs.map(l => l.habit_id);
  const pendingHabits = habits.filter(h => !completedHabits.includes(h.id));
  
  if (pendingHabits.length > 0) {
    // Tomar uno aleatorio o el primero
    const habit = pendingHabits[0];
    suggestions.push({
      id: `habit-${habit.id}`,
      type: 'habit',
      priority: 'medium',
      title: 'Hábito pendiente',
      description: `No olvides: ${habit.name}`,
      action: { label: 'Registrar', href: '/habits' }
    });
  }

  // 5. Sueño
  if (!sleepLog && new Date().getHours() < 12) {
    suggestions.push({
      id: 'sleep-missing',
      type: 'sleep',
      priority: 'medium',
      title: 'Registro de sueño',
      description: '¿Qué tal dormiste anoche?',
      action: { label: 'Registrar', href: '/tasks' } // Asumiendo que está en /tasks o dashboard
    });
  }

  // 6. Finanzas: Presupuestos excedidos
  const overBudget = budgets.filter(b => b.spent > b.amount * 0.9);
  if (overBudget.length > 0) {
    const b = overBudget[0];
    suggestions.push({
      id: `budget-${b.id}`,
      type: 'finance' as any, // Type assertion as 'finance' might not be in the Suggestion type yet
      priority: b.spent > b.amount ? 'high' : 'medium',
      title: b.spent > b.amount ? 'Presupuesto excedido' : 'Presupuesto en riesgo',
      description: `Has gastado ${b.spent}€ de ${b.amount}€ en ${b.category?.name || 'una categoría'}.`,
      action: { label: 'Ver finanzas', href: '/finance' }
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return suggestions.sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}