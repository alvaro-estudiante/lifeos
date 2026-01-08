"use server";

import { getDailySummary } from "./nutrition-summary";
import { getMealsByDate } from "./meals";
import { getNutritionGoals } from "./nutrition-goals";
import { getTasksForDate, getTasks } from "./tasks";
import { getHabits, getHabitLogsForDate } from "./habits";
import { getWorkoutHistory } from "./workouts";
import { getSleepLog } from "./sleep";
import { getUserProfile } from "./user";

export async function getDashboardData(userId: string) {
  // Execute all queries in parallel for performance
  const today = new Date().toISOString().split('T')[0];
  
  // We need to calculate weekly volume manually from history for now as getWeeklyWorkoutStats is not implemented
  // Also getTasksStats is not implemented, we can derive from getTasks
  
  const [
    nutritionSummary,
    todayMeals,
    nutritionGoals,
    todayTasks,
    allTasks,
    habits,
    habitLogs,
    workoutHistory,
    sleepLog,
    userProfile
  ] = await Promise.all([
    getDailySummary(today).catch(() => ({ consumed: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }, goals: null })),
    getMealsByDate(today).catch(() => []),
    getNutritionGoals().catch(() => null),
    getTasksForDate(today).catch(() => []),
    getTasks().catch(() => []),
    getHabits().catch(() => []),
    getHabitLogsForDate(today).catch(() => []),
    getWorkoutHistory(10).catch(() => []),
    getSleepLog(today).catch(() => null),
    getUserProfile(userId).catch(() => ({ id: userId, full_name: 'Usuario' }))
  ]);

  // Calculate task stats
  const completedTasksCount = todayTasks.filter(t => t.status === 'completed').length;
  const totalTasksCount = todayTasks.length;

  // Calculate fitness stats
  const lastWorkout = workoutHistory.length > 0 ? workoutHistory[0] : null;
  
  // Calculate weekly volume
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyVolume = workoutHistory.reduce((acc, w) => {
    const workoutDate = new Date(w.workout_date);
    if (workoutDate > oneWeekAgo) {
      return acc + (w.total_volume || 0);
    }
    return acc;
  }, 0);

  // Calculate workout streak (simplified)
  let currentStreak = 0;
  // This logic is complex to do perfectly without a recursive query or careful iteration
  // For MVP, let's just count consecutive days backwards from today/yesterday in history
  // Assuming history is sorted desc
  const todayDate = new Date();
  let checkDate = new Date(todayDate);
  
  // Check if worked out today
  const workedOutToday = workoutHistory.some(w => w.workout_date.split('T')[0] === today);
  if (workedOutToday) currentStreak++;
  
  // Check previous days... (simplified for now, maybe just 0 if no logic implemented robustly)
  
  // Merge habits
  const habitsWithLogs = habits.map(habit => {
    const log = habitLogs.find(l => l.habit_id === habit.id);
    return {
      ...habit,
      todaysLog: log,
    };
  });

  return {
    nutrition: { summary: nutritionSummary, meals: todayMeals, goals: nutritionGoals },
    tasks: { today: todayTasks, completedCount: completedTasksCount, totalCount: totalTasksCount },
    habits: { list: habitsWithLogs },
    fitness: { lastWorkout, weeklyVolume, streak: currentStreak }, // Streak logic placeholder
    sleep: sleepLog,
    user: userProfile
  };
}