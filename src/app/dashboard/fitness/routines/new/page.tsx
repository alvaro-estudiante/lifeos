import { RoutineEditor } from "@/components/fitness/RoutineEditor";

export default function NewRoutinePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Nueva Rutina</h1>
        <p className="text-muted-foreground">
          Diseña tu rutina de entrenamiento personalizada.
        </p>
      </div>
      <RoutineEditor />
    </div>
  );
}