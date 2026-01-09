import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: items } = await supabase
    .from('pantry_items')
    .select('id, name, quantity, unit')
    .eq('user_id', user.id)
    .eq('is_available', true);

  return NextResponse.json(items || []);
}
