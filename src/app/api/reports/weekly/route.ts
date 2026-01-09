import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { eachDayOfInterval, parseISO } from 'date-fns';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json({ error: 'Missing dates' }, { status: 400 });
  }

  const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });
  const numDays = days.length;

  // Get nutrition data
  const { data: meals } = await supabase
    .from('meals')
    .select('total_calories, total_protein, total_carbs, total_fat')
    .eq('user_id', user.id)
    .gte('meal_date', start)
    .lte('meal_date', end);

  const { data: goals } = await supabase
    .from('nutrition_goals')
    .select('calories_target')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  const totalCalories = (meals || []).reduce((s, m) => s + (m.total_calories || 0), 0);
  const totalProtein = (meals || []).reduce((s, m) => s + (m.total_protein || 0), 0);
  const totalCarbs = (meals || []).reduce((s, m) => s + (m.total_carbs || 0), 0);
  const totalFat = (meals || []).reduce((s, m) => s + (m.total_fat || 0), 0);

  const avgCalories = Math.round(totalCalories / numDays);
  const targetCalories = goals?.calories_target || 2000;
  const adherence = Math.round((avgCalories / targetCalories) * 100);

  // Get fitness data
  const { data: workouts } = await supabase
    .from('workouts')
    .select(`
      duration_minutes,
      total_volume,
      workout_exercises (
        exercise_name,
        workout_sets (weight_kg, reps)
      )
    `)
    .eq('user_id', user.id)
    .gte('workout_date', start)
    .lte('workout_date', end);

  const { data: exercises } = await supabase
    .from('exercises')
    .select('name, muscle_group')
    .eq('user_id', user.id);

  const exerciseMap = new Map((exercises || []).map(e => [e.name, e.muscle_group]));

  const muscleVolumes: Record<string, number> = {};
  (workouts || []).forEach((w: any) => {
    (w.workout_exercises || []).forEach((we: any) => {
      const muscle = exerciseMap.get(we.exercise_name) || 'other';
      const volume = (we.workout_sets || []).reduce((s: number, set: any) => 
        s + ((set.weight_kg || 0) * (set.reps || 0)), 0
      );
      muscleVolumes[muscle] = (muscleVolumes[muscle] || 0) + volume;
    });
  });

  // Get tasks data
  const { data: completedTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('completed_at', start)
    .lte('completed_at', end);

  const { data: createdTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', start)
    .lte('created_at', end);

  const tasksCompleted = completedTasks?.length || 0;
  const tasksCreated = createdTasks?.length || 0;

  // Get habits data
  const { data: habits } = await supabase
    .from('habits')
    .select('id, name, target_value')
    .eq('user_id', user.id)
    .eq('is_active', true);

  const habitIds = (habits || []).map(h => h.id);
  const { data: habitLogs } = await supabase
    .from('habit_logs')
    .select('habit_id, value')
    .in('habit_id', habitIds.length > 0 ? habitIds : ['__none__'])
    .gte('log_date', start)
    .lte('log_date', end);

  const habitStats = (habits || []).map(h => {
    const logs = (habitLogs || []).filter(l => l.habit_id === h.id);
    const completed = logs.filter(l => l.value >= h.target_value).length;
    return {
      name: h.name,
      rate: Math.round((completed / numDays) * 100),
    };
  });

  const avgHabitRate = habitStats.length > 0
    ? Math.round(habitStats.reduce((s, h) => s + h.rate, 0) / habitStats.length)
    : 0;

  const sortedHabits = [...habitStats].sort((a, b) => b.rate - a.rate);
  const bestHabit = sortedHabits[0] || null;
  const worstHabit = sortedHabits[sortedHabits.length - 1] || null;

  // Generate highlights and improvements
  const highlights: string[] = [];
  const improvements: string[] = [];

  if (adherence >= 90) highlights.push('Excelente adherencia nutricional');
  else if (adherence < 70) improvements.push('Mejorar consistencia en nutrición');

  if ((workouts?.length || 0) >= 4) highlights.push(`${workouts?.length} entrenamientos completados`);
  else if ((workouts?.length || 0) < 2) improvements.push('Aumentar frecuencia de entrenamiento');

  if (tasksCompleted > tasksCreated * 0.8) highlights.push('Alta productividad en tareas');
  else if (tasksCompleted < tasksCreated * 0.5) improvements.push('Completar más tareas pendientes');

  if (avgHabitRate >= 80) highlights.push('Hábitos consistentes');
  else if (avgHabitRate < 50) improvements.push('Enfocarse más en hábitos diarios');

  if (bestHabit && bestHabit.rate >= 90) highlights.push(`"${bestHabit.name}" al ${bestHabit.rate}%`);
  if (worstHabit && worstHabit.rate < 50) improvements.push(`Trabajar en "${worstHabit.name}"`);

  const report = {
    period: { start, end },
    nutrition: {
      avgCalories,
      avgProtein: Math.round(totalProtein / numDays),
      avgCarbs: Math.round(totalCarbs / numDays),
      avgFat: Math.round(totalFat / numDays),
      targetCalories,
      adherence: Math.min(adherence, 100),
    },
    fitness: {
      workouts: workouts?.length || 0,
      totalVolume: (workouts || []).reduce((s, w) => s + (w.total_volume || 0), 0),
      avgDuration: workouts?.length 
        ? Math.round((workouts || []).reduce((s, w) => s + (w.duration_minutes || 0), 0) / workouts.length)
        : 0,
      muscleGroups: Object.entries(muscleVolumes)
        .map(([name, volume]) => ({ name, volume }))
        .sort((a, b) => b.volume - a.volume),
    },
    tasks: {
      completed: tasksCompleted,
      created: tasksCreated,
      completionRate: tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0,
    },
    habits: {
      avgCompletionRate: avgHabitRate,
      bestHabit,
      worstHabit: worstHabit !== bestHabit ? worstHabit : null,
    },
    highlights,
    improvements,
  };

  return NextResponse.json(report);
}
