import { getRoutineById } from "@/lib/actions/routines";
import { RoutineEditor } from "@/components/fitness/RoutineEditor";
import { notFound } from "next/navigation";

interface RoutineDetailPageProps {
  params: {
    id: string;
  };
}

export default async function RoutineDetailPage({ params }: RoutineDetailPageProps) {
  try {
    const routine = await getRoutineById(params.id);

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Editar Rutina</h1>
        </div>
        <RoutineEditor initialData={routine} />
      </div>
    );
  } catch {
    notFound();
  }
}