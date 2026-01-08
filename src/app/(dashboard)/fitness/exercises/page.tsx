import { getExercises } from "@/lib/actions/exercises";
// import { ExerciseCard } from "@/components/fitness/ExerciseCard";
// import { Button } from "@/components/ui/button";
// import { Plus, Search } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { ExerciseForm } from "@/components/fitness/ExerciseForm";
import { ExercisePageClient } from "./client";

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return (
    <ExercisePageClient initialExercises={exercises} />
  );
}