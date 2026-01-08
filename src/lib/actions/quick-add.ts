'use server';

import { getSessionOrThrow } from '@/lib/auth/session';
import { processVoiceCommand } from '@/lib/actions/voice';
import { createTask } from './tasks';
import { addMealItem } from './meals';
import { logHabit, getHabits } from './habits';
import { revalidatePath } from 'next/cache';

interface QuickAddResult {
  success: boolean;
  message: string;
}

export async function processQuickAdd(input: string): Promise<QuickAddResult> {
  const { user } = await getSessionOrThrow();
  const trimmed = input.trim();

  // 1. Detección rápida de patrones (sin IA)
  
  // Tareas: "tarea: comprar leche"
  const taskMatch = trimmed.match(/^tarea:?\s*(.+)/i);
  if (taskMatch) {
    const title = taskMatch[1];
    await createTask({
      title,
      priority: 'medium',
      status: 'pending',
      description: null,
      due_date: null,
      due_time: null,
      estimated_minutes: null,
      actual_minutes: null,
      category: null,
      tags: [],
      parent_task_id: null,
      completed_at: null
    });
    return { success: true, message: `Tarea creada: ${title}` };
  }

  // Hábitos: "agua +1" o "leer +30"
  const habitMatch = trimmed.match(/^(.+?)\s*\+(\d+)$/i);
  if (habitMatch) {
    const habitName = habitMatch[1].trim();
    const value = parseInt(habitMatch[2]);
    
    const habits = await getHabits(true);
    const habit = habits.find(h => 
      h.name.toLowerCase().includes(habitName.toLowerCase())
    );

    if (habit) {
      const today = new Date().toISOString().split('T')[0];
      await logHabit(habit.id, today, value);
      return { success: true, message: `Hábito actualizado: ${habit.name} (+${value})` };
    }
  }

  // Comidas: "desayuno: huevos"
  const mealMatch = trimmed.match(/^(desayuno|almuerzo|cena|snack):?\s*(.+)/i);
  if (mealMatch) {
    const mealTypeMap: Record<string, 'breakfast' | 'lunch' | 'dinner' | 'snack'> = {
      desayuno: 'breakfast',
      almuerzo: 'lunch',
      cena: 'dinner',
      snack: 'snack'
    };
    const mealType = mealTypeMap[mealMatch[1].toLowerCase()];
    const foodName = mealMatch[2];
    
    const today = new Date().toISOString().split('T')[0];
    await addMealItem(today, mealType, {
      food_name: foodName,
      quantity: 100, // Default
      unit: 'g',
      calories: 0, // Placeholder until AI lookup
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    });
    
    return { success: true, message: `Añadido a ${mealMatch[1]}: ${foodName}` };
  }

  // 2. Fallback a procesamiento con IA (OpenAI)
  // Reutilizamos la lógica de voz que ya está optimizada para entender lenguaje natural
  return await processVoiceCommand(input);
}