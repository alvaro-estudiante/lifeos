import { getHabits, getHabitLogsForDate } from "@/lib/actions/habits";
import { HabitPageClient } from "./client";

export default async function HabitsPage() {
  const date = new Date().toISOString().split("T")[0]; // Today
  
  const [habits, habitLogs] = await Promise.all([
    getHabits(),
    getHabitLogsForDate(date),
  ]);

  // Merge habits with logs
  const habitsWithLogs = habits.map(habit => {
    const log = habitLogs.find(l => l.habit_id === habit.id);
    return {
      ...habit,
      todaysLog: log,
    };
  });

  return (
    <HabitPageClient initialHabits={habitsWithLogs} />
  );
}