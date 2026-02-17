import { createClient } from "@/lib/supabase/server";
import { calculateStreak, calculateWeekCount } from "@/lib/calculations";
import { StatsRow } from "./_components/stats-row";
import { RecentWorkouts } from "./_components/recent-workouts";
import { StartWorkoutDialog } from "./_components/start-workout-dialog";
import type { Workout, Routine } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: workouts }, { data: routines }] = await Promise.all([
    supabase
      .from("workouts")
      .select("*")
      .order("date", { ascending: false }),
    supabase
      .from("routines")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const allWorkouts = (workouts ?? []) as Workout[];
  const allRoutines = (routines ?? []) as Routine[];

  const totalWorkouts = allWorkouts.length;
  const thisWeek = calculateWeekCount(allWorkouts);
  const streak = calculateStreak(allWorkouts);
  const recent = allWorkouts.slice(0, 5);

  return (
    <div>
      <StatsRow total={totalWorkouts} thisWeek={thisWeek} streak={streak} />
      <StartWorkoutDialog routines={allRoutines} />
      <RecentWorkouts workouts={recent} />
    </div>
  );
}
