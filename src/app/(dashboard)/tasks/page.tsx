import { getTasks } from "@/lib/actions/tasks";
import { TaskPageClient } from "./client";

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <TaskPageClient initialTasks={tasks} />
  );
}