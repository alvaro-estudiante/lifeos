import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSessionOrThrow(): Promise<{ user: User; supabase: any }> {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }
  
  return { user, supabase };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSessionOrNull(): Promise<{ user: User | null; supabase: any }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { user, supabase };
}