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
    return NextResponse.json({ error: 'Missing start or end date' }, { status: 400 });
  }

  // Get user's nutrition goals
  const { data: goals } = await supabase
    .from('nutrition_goals')
    .select('calories_target')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  const target = goals?.calories_target || 2000;

  // Get meals for date range
  const { data: meals } = await supabase
    .from('meals')
    .select('meal_date, total_calories, total_protein, total_carbs, total_fat')
    .eq('user_id', user.id)
    .gte('meal_date', start)
    .lte('meal_date', end);

  // Generate all days in range
  const days = eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(end),
  });

  // Aggregate by day
  const result = days.map(day => {
    const dateStr = day.toISOString().split('T')[0];
    const dayMeals = (meals || []).filter(m => m.meal_date === dateStr);
    
    return {
      date: dateStr,
      calories: Math.round(dayMeals.reduce((sum, m) => sum + (m.total_calories || 0), 0)),
      protein: Math.round(dayMeals.reduce((sum, m) => sum + (m.total_protein || 0), 0)),
      carbs: Math.round(dayMeals.reduce((sum, m) => sum + (m.total_carbs || 0), 0)),
      fat: Math.round(dayMeals.reduce((sum, m) => sum + (m.total_fat || 0), 0)),
      target,
    };
  });

  return NextResponse.json(result);
}
