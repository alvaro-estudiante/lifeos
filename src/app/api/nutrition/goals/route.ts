import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // First, deactivate all existing goals
  await supabase
    .from('nutrition_goals')
    .update({ is_active: false })
    .eq('user_id', user.id);

  // Create new active goal
  const { error } = await supabase
    .from('nutrition_goals')
    .insert({
      user_id: user.id,
      calories_target: body.calories_target,
      protein_g: body.protein_g,
      carbs_g: body.carbs_g,
      fat_g: body.fat_g,
      fiber_g: body.fiber_g || 30,
      water_ml: body.water_ml || 2500,
      is_active: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
