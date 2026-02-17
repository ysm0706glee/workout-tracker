import { createClient } from "@/lib/supabase/server";
import { ProgressDashboard } from "./_components/progress-dashboard";
import type { Workout } from "@/types/database";

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: workouts } = await supabase
    .from("workouts")
    .select("*")
    .order("date", { ascending: true });

  return <ProgressDashboard workouts={(workouts ?? []) as Workout[]} />;
}
