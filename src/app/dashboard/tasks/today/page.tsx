import { getTasksForDate } from "@/lib/actions/tasks";
import { getHabits, getHabitLogsForDate } from "@/lib/actions/habits";
import { getSleepLog } from "@/lib/actions/sleep";
import { DayTimeline } from "@/components/productivity/DayTimeline";
import { SleepLogForm } from "@/components/productivity/SleepLogForm";
import { TodayHabitsList } from "@/components/productivity/TodayHabitsList";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TodayPageProps {
  searchParams: { date?: string };
}

export default async function TodayPage({ searchParams }: TodayPageProps) {
  // Use provided date or default to current ISO date (UTC)
  // Ideally this should be local date, but server doesn't know it.
  // We'll rely on the user navigating or default to server's 'today'.
  const date = searchParams.date || new Date().toISOString().split("T")[0];
  const displayDate = new Date(date);

  const prevDay = new Date(displayDate);
  prevDay.setDate(prevDay.getDate() - 1);
  const nextDay = new Date(displayDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Parallel fetch
  const [tasks, habits, habitLogs, sleepLog] = await Promise.all([
    getTasksForDate(date),
    getHabits(),
    getHabitLogsForDate(date),
    getSleepLog(date),
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
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-8 w-8 text-primary" />
          {format(displayDate, "EEEE d 'de' MMMM", { locale: es })}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/tasks/today?date=${prevDay.toISOString().split("T")[0]}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/tasks/today?date=${nextDay.toISOString().split("T")[0]}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Timeline Column */}
        <div className="lg:col-span-2 h-full flex flex-col min-h-0">
          <DayTimeline tasks={tasks} habits={habits} date={date} />
        </div>

        {/* Sidebar Column: Sleep & Habits */}
        <div className="space-y-6 overflow-y-auto">
          <SleepLogForm date={date} initialData={sleepLog} />
          <TodayHabitsList habits={habitsWithLogs} date={date} />
        </div>
      </div>
    </div>
  );
}