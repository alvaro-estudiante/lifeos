import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { subDays, format, eachDayOfInterval } from 'date-fns';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get('days') || '90');
  const startDate = subDays(new Date(), days);
  const startDateStr = format(startDate, 'yyyy-MM-dd');

  // Get all active habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (!habits || habits.length === 0) {
    return NextResponse.json([]);
  }

  // Get all logs for the period
  const habitIds = habits.map(h => h.id);
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*')
    .in('habit_id', habitIds)
    .gte('log_date', startDateStr);

  // Generate all dates in range
  const dateRange = eachDayOfInterval({
    start: startDate,
    end: new Date(),
  });
  const totalDays = dateRange.length;

  // Process each habit
  const result = habits.map(habit => {
    const habitLogs = (logs || []).filter(l => l.habit_id === habit.id);
    const logsMap = new Map(habitLogs.map(l => [l.log_date, l.value]));

    // Calculate completions
    let totalCompletions = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Iterate from oldest to newest for streak calculation
    for (let i = 0; i < dateRange.length; i++) {
      const dateStr = format(dateRange[i], 'yyyy-MM-dd');
      const value = logsMap.get(dateStr) || 0;
      const completed = value >= habit.target_value;

      if (completed) {
        totalCompletions++;
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Current streak (from today backwards)
    let currentStreak = 0;
    for (let i = dateRange.length - 1; i >= 0; i--) {
      const dateStr = format(dateRange[i], 'yyyy-MM-dd');
      const value = logsMap.get(dateStr) || 0;
      if (value >= habit.target_value) {
        currentStreak++;
      } else {
        break;
      }
    }

    const completionRate = totalDays > 0 ? Math.round((totalCompletions / totalDays) * 100) : 0;

    return {
      id: habit.id,
      name: habit.name,
      color: habit.color || '#3b82f6',
      icon: habit.icon || '✓',
      target_value: habit.target_value,
      current_streak: currentStreak,
      best_streak: Math.max(bestStreak, habit.best_streak || 0),
      completion_rate: completionRate,
      total_completions: totalCompletions,
      logs: habitLogs.map(l => ({ date: l.log_date, value: l.value })),
    };
  });

  return NextResponse.json(result);
}
