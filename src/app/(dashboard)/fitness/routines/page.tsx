import { getRoutines } from "@/lib/actions/routines";
import { RoutineCard } from "@/components/fitness/RoutineCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function RoutinesPage() {
  const routines = await getRoutines();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Mis Rutinas</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/fitness/routines/templates">
              Explorar Plantillas
            </Link>
          </Button>
          <Button asChild>
            <Link href="/fitness/routines/new">
              <Plus className="mr-2 h-4 w-4" /> Crear Rutina
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {routines.map((routine) => (
          <RoutineCard key={routine.id} routine={routine} />
        ))}
      </div>

      {routines.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No tienes rutinas creadas. ¡Empieza creando una!
        </div>
      )}
    </div>
  );
}