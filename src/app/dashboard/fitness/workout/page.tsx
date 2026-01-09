import { getActiveWorkout, startWorkout } from "@/lib/actions/workouts";
import { WorkoutPageClient } from "./client";
import { redirect } from "next/navigation";

export default async function WorkoutPage() {
  let workout = await getActiveWorkout();

  if (!workout) {
    workout = await startWorkout(); 
  }

  if (!workout) {
    redirect("/fitness");
  }

  return (
    <WorkoutPageClient workout={workout} />
  );
}