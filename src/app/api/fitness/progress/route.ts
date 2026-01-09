import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { subDays, startOfWeek, startOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get('days') || '90');
  const startDate = subDays(new Date(), days).toISOString().split('T')[0];

  // Get all workouts with exercises and sets
  const { data: workouts } = await supabase
    .from('workouts')
    .select(`
      id,
      workout_date,
      duration_minutes,
      total_volume,
      workout_exercises (
        id,
        exercise_id,
        exercise_name,
        workout_sets (
          weight_kg,
          reps
        )
      )
    `)
    .eq('user_id', user.id)
    .gte('workout_date', startDate)
    .order('workout_date', { ascending: true });

  // Get exercises info
  const { data: exercisesInfo } = await supabase
    .from('exercises')
    .select('id, name, muscle_group')
    .eq('user_id', user.id);

  const exerciseMap = new Map(
    (exercisesInfo || []).map(e => [e.id, e])
  );

  // Process exercises progress
  const exerciseProgress: Record<string, {
    exercise_id: string;
    exercise_name: string;
    muscle_group: string;
    history: { date: string; max_weight: number; total_volume: number; sets: number }[];
    pr: { weight: number; date: string };
  }> = {};

  (workouts || []).forEach(workout => {
    (workout.workout_exercises || []).forEach((we: any) => {
      const exerciseInfo = exerciseMap.get(we.exercise_id);
      const exerciseId = we.exercise_id || we.exercise_name;
      
      if (!exerciseProgress[exerciseId]) {
        exerciseProgress[exerciseId] = {
          exercise_id: exerciseId,
          exercise_name: we.exercise_name || exerciseInfo?.name || 'Unknown',
          muscle_group: exerciseInfo?.muscle_group || 'other',
          history: [],
          pr: { weight: 0, date: '' },
        };
      }

      const sets = we.workout_sets || [];
      const maxWeight = Math.max(...sets.map((s: any) => s.weight_kg || 0), 0);
      const totalVolume = sets.reduce((sum: number, s: any) => 
        sum + ((s.weight_kg || 0) * (s.reps || 0)), 0
      );

      exerciseProgress[exerciseId].history.push({
        date: workout.workout_date,
        max_weight: maxWeight,
        total_volume: totalVolume,
        sets: sets.length,
      });

      if (maxWeight > exerciseProgress[exerciseId].pr.weight) {
        exerciseProgress[exerciseId].pr = {
          weight: maxWeight,
          date: workout.workout_date,
        };
      }
    });
  });

  // Calculate stats
  const totalWorkouts = workouts?.length || 0;
  const totalVolume = (workouts || []).reduce((sum, w) => sum + (w.total_volume || 0), 0);
  const avgDuration = totalWorkouts > 0 
    ? Math.round((workouts || []).reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / totalWorkouts)
    : 0;

  // Calculate streak
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  const workoutDates = new Set((workouts || []).map(w => w.workout_date));
  
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const checkDate = subDays(today, i).toISOString().split('T')[0];
    if (workoutDates.has(checkDate)) {
      tempStreak++;
      if (i === 0 || tempStreak > 1) currentStreak = tempStreak;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      if (i > 0) tempStreak = 0;
    }
  }

  // This week/month
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().split('T')[0];
  const monthStart = startOfMonth(new Date()).toISOString().split('T')[0];
  
  const workoutsThisWeek = (workouts || []).filter(w => w.workout_date >= weekStart).length;
  const workoutsThisMonth = (workouts || []).filter(w => w.workout_date >= monthStart).length;

  return NextResponse.json({
    exercises: Object.values(exerciseProgress).filter(e => e.history.length > 0),
    stats: {
      total_workouts: totalWorkouts,
      total_volume: totalVolume,
      avg_duration: avgDuration,
      current_streak: currentStreak,
      best_streak: bestStreak,
      workouts_this_week: workoutsThisWeek,
      workouts_this_month: workoutsThisMonth,
    },
  });
}
