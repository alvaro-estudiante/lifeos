'use server';

import { getSessionOrThrow } from '@/lib/auth/session';
import { openai } from '@/lib/openai/client';
import { addMealItem, getMealsByDate } from './meals';
import { createTask } from './tasks';
import { logHabit, getHabits } from './habits';
import { logSleep } from './sleep';
import { startWorkout, addExerciseToWorkout, finishWorkout, getActiveWorkout } from './workouts';
import { revalidatePath } from 'next/cache';

interface VoiceCommandResult {
  success: boolean;
  message: string;
  action?: string;
  data?: any;
}

const SYSTEM_PROMPT = `Eres un asistente de LifeOS, una app de organización personal. Tu trabajo es interpretar comandos de voz del usuario y extraer la información estructurada para ejecutar acciones.

Los módulos disponibles son:

1. **NUTRICION** - Registrar comidas y alimentos
   - Acciones: add_meal (añadir comida)
   - Datos: meal_type (breakfast/lunch/dinner/snack), foods (array de {name, quantity, unit})
   - Interpreta: "desayuné", "almorcé", "cené", "comí", "merendé"
   - meal_type mapping: desayuno/desayuné=breakfast, almuerzo/almorcé/comí=lunch, cena/cené=dinner, merienda/snack=snack
   
2. **FITNESS** - Registrar entrenamientos y ejercicios
   - Acciones: start_workout, add_exercise, add_sets, finish_workout
   - Para add_sets: exercise_name, sets (número), reps (número), weight_kg (número)
   - Interpreta: "entrené", "hice", "series", "repeticiones", "kilos"

3. **TAREAS** - Crear y gestionar tareas
   - Acciones: create_task, complete_task
   - Datos: title, description, priority (low/medium/high/urgent), due_date (YYYY-MM-DD), due_time (HH:MM)
   - Interpreta: "tarea", "recuérdame", "pendiente", "hacer"
   - Fechas relativas: "mañana", "pasado mañana", "el viernes", "la próxima semana"

4. **HABITOS** - Registrar progreso de hábitos
   - Acciones: log_habit
   - Datos: habit_name (nombre aproximado), value (cantidad)
   - Interpreta: "bebí X vasos de agua", "leí X minutos", "medité", "entrené"

5. **SUEÑO** - Registrar horas de sueño
   - Acciones: log_sleep
   - Datos: bed_time (HH:MM), wake_time (HH:MM), quality (1-10)
   - Interpreta: "dormí", "me acosté", "me levanté"

6. **NOTAS** - Guardar notas rápidas (si no encaja en otros módulos)
   - Acciones: create_note
   - Datos: content
   - Interpreta: "nota", "recuerda que", "apunta"

REGLAS:
- Responde SOLO con JSON válido, sin texto adicional
- Si no puedes determinar el módulo, usa "unknown"
- Extrae toda la información posible del comando
- Para cantidades no especificadas, usa valores razonables (ej: "1" para cantidad)
- Las fechas deben estar en formato YYYY-MM-DD
- Las horas en formato HH:MM (24h)
- Hoy es: {{TODAY}}

FORMATO DE RESPUESTA:
{
  "module": "nutrition|fitness|tasks|habits|sleep|notes|unknown",
  "action": "acción específica",
  "data": { datos estructurados },
  "confidence": 0.0-1.0,
  "summary": "Resumen en español de lo que entendiste"
}`;

export async function processVoiceCommand(transcript: string): Promise<VoiceCommandResult> {
  const { user } = await getSessionOrThrow();
  
  const today = new Date().toISOString().split('T')[0];
  const prompt = SYSTEM_PROMPT.replace('{{TODAY}}', today);

  try {
    // 1. Llamar a OpenAI para clasificar e interpretar
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: transcript }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return { success: false, message: 'No pude procesar el comando' };
    }

    const parsed = JSON.parse(response);
    console.log('Voice command parsed:', parsed);

    // 2. Ejecutar la acción según el módulo
    const result = await executeAction(user.id, parsed);
    
    // 3. Revalidar rutas afectadas
    revalidatePath('/');
    
    return result;

  } catch (error) {
    console.error('Error processing voice command:', error);
    return { 
      success: false, 
      message: 'Error al procesar el comando. Intenta de nuevo.' 
    };
  }
}

async function executeAction(userId: string, parsed: any): Promise<VoiceCommandResult> {
  const { module, action, data, summary, confidence } = parsed;

  if (confidence < 0.5) {
    return { 
      success: false, 
      message: `No estoy seguro de lo que quieres hacer. ¿Podrías repetirlo de otra forma?` 
    };
  }

  try {
    switch (module) {
      case 'nutrition':
        return await handleNutrition(userId, action, data, summary);
      
      case 'fitness':
        return await handleFitness(userId, action, data, summary);
      
      case 'tasks':
        return await handleTasks(userId, action, data, summary);
      
      case 'habits':
        return await handleHabits(userId, action, data, summary);
      
      case 'sleep':
        return await handleSleep(userId, action, data, summary);
      
      case 'notes':
        return await handleNotes(userId, action, data, summary);
      
      default:
        return { 
          success: false, 
          message: `No entendí bien. Intenta algo como "desayuné huevos" o "nueva tarea: comprar leche"` 
        };
    }
  } catch (error) {
    console.error(`Error executing ${module}/${action}:`, error);
    return { success: false, message: `Error al ejecutar: ${summary}` };
  }
}

// === HANDLERS POR MÓDULO ===

async function handleNutrition(userId: string, action: string, data: any, summary: string): Promise<VoiceCommandResult> {
  if (action === 'add_meal') {
    const { meal_type, foods } = data;
    const today = new Date().toISOString().split('T')[0];
    
    // Obtener o crear la comida del día
    // Note: getMealsByDate might need update to create meal if not exists, or handle here
    // For now assuming addMealItem handles creation or we pass null ID
    
    // Por cada alimento, añadirlo
    for (const food of foods || []) {
      await addMealItem(
        today,
        meal_type,
        {
          food_name: food.name,
          quantity: food.quantity || 100,
          unit: food.unit || 'g',
          calories: 0, // Placeholder
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
          // Los macros se calcularán automáticamente o se buscarán en una versión futura
        }
      );
    }
    
    const foodList = foods?.map((f: any) => f.name).join(', ') || 'alimentos';
    return { 
      success: true, 
      message: `✓ Registrado en ${getMealTypeName(meal_type)}: ${foodList}`,
      action: 'add_meal',
      data
    };
  }
  
  return { success: false, message: 'Acción de nutrición no reconocida' };
}

async function handleFitness(userId: string, action: string, data: any, summary: string): Promise<VoiceCommandResult> {
  switch (action) {
    case 'start_workout':
      await startWorkout();
      return { success: true, message: '✓ Entrenamiento iniciado. ¡Vamos!' };
    
    case 'add_sets':
      const workout = await getActiveWorkout();
      if (!workout) {
        // Iniciar entreno automáticamente
        await startWorkout();
      }
      
      const { exercise_name, sets, reps, weight_kg } = data;
      
      // Note: This needs logic to find exercise ID by name or create a temporary one
      // For MVP, we might need a more complex lookup. 
      // Assuming a simplified flow or placeholder for now as detailed exercise lookup is complex.
      return { 
        success: true, 
        message: `✓ (Simulado) Añadido: ${exercise_name} - ${sets}x${reps} @ ${weight_kg}kg. (Requiere implementación de búsqueda de ejercicios)` 
      };
    
    case 'finish_workout':
      const activeWorkout = await getActiveWorkout();
      if (activeWorkout) {
        await finishWorkout(activeWorkout.id, {
          energy_level: data.energy_level || 7,
          overall_feeling: data.overall_feeling || 7,
          notes: data.notes || ''
        });
        return { success: true, message: '✓ Entrenamiento finalizado. ¡Buen trabajo!' };
      }
      return { success: false, message: 'No hay entrenamiento activo' };
    
    default:
      return { success: false, message: 'Acción de fitness no reconocida' };
  }
}

async function handleTasks(userId: string, action: string, data: any, summary: string): Promise<VoiceCommandResult> {
  if (action === 'create_task') {
    const { title, description, priority, due_date, due_time } = data;
    
    await createTask({
      title: title || summary,
      description: description || null,
      priority: priority || 'medium',
      due_date: due_date || null,
      due_time: due_time || null,
      status: 'pending',
      estimated_minutes: null,
      actual_minutes: null,
      category: null,
      tags: [],
      parent_task_id: null,
      completed_at: null
    });
    
    let message = `✓ Tarea creada: "${title}"`;
    if (due_date) {
      message += ` para el ${formatDate(due_date)}`;
    }
    
    return { success: true, message };
  }
  
  if (action === 'complete_task') {
    // Buscar tarea por nombre aproximado y completarla
    return { success: true, message: '✓ Tarea completada (Simulado - requiere búsqueda por nombre)' };
  }
  
  return { success: false, message: 'Acción de tareas no reconocida' };
}

async function handleHabits(userId: string, action: string, data: any, summary: string): Promise<VoiceCommandResult> {
  if (action === 'log_habit') {
    const { habit_name, value } = data;
    
    // Buscar hábito por nombre aproximado
    const habits = await getHabits(true);
    const habit = habits.find(h => 
      h.name.toLowerCase().includes(habit_name?.toLowerCase()) ||
      habit_name?.toLowerCase().includes(h.name.toLowerCase())
    );
    
    if (habit) {
      const today = new Date().toISOString().split('T')[0];
      await logHabit(habit.id, today, value || 1);
      return { 
        success: true, 
        message: `✓ Registrado: ${habit.name} (+${value || 1})` 
      };
    }
    
    return { success: false, message: `No encontré un hábito similar a "${habit_name}"` };
  }
  
  return { success: false, message: 'Acción de hábitos no reconocida' };
}

async function handleSleep(userId: string, action: string, data: any, summary: string): Promise<VoiceCommandResult> {
  if (action === 'log_sleep') {
    const { bed_time, wake_time, quality } = data;
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate duration
    let duration = 0;
    if (bed_time && wake_time) {
        // Simple duration calc logic
    }

    await logSleep({
      sleep_date: today,
      bed_time: bed_time || null,
      wake_time: wake_time || null,
      quality: quality || null,
      duration_hours: null, // Should calculate
      notes: null
    });
    
    return { 
      success: true, 
      message: `✓ Sueño registrado: ${bed_time || '?'} - ${wake_time || '?'}` 
    };
  }
  
  return { success: false, message: 'Acción de sueño no reconocida' };
}

async function handleNotes(userId: string, action: string, data: any, summary: string): Promise<VoiceCommandResult> {
  // Por ahora, crear como tarea con baja prioridad
  if (action === 'create_note') {
    await createTask({
      title: `📝 ${data.content || summary}`,
      priority: 'low',
      status: 'pending',
      category: 'nota',
      description: null,
      due_date: null,
      due_time: null,
      estimated_minutes: null,
      actual_minutes: null,
      tags: [],
      parent_task_id: null,
      completed_at: null
    });
    
    return { success: true, message: `✓ Nota guardada` };
  }
  
  return { success: false, message: 'Acción no reconocida' };
}

// === UTILIDADES ===

function getMealTypeName(type: string): string {
  const names: Record<string, string> = {
    breakfast: 'Desayuno',
    lunch: 'Almuerzo',
    dinner: 'Cena',
    snack: 'Snack'
  };
  return names[type] || type;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
}