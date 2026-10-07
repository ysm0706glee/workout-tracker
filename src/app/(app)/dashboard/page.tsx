import { createClient } from "@/lib/supabase/server";
import { getRoutines } from "@/lib/supabase/queries";
import { calculateWeekCount } from "@/lib/calculations";
import { StatsRow } from "./_components/stats-row";
import { RecentWorkouts } from "./_components/recent-workouts";
import { StartWorkoutDialog } from "./_components/start-workout-dialog";
import type { WorkoutSummary } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Only dates from the last week are needed for the "This Week" stat
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [{ count }, { data: weekDates }, { data: recent }, routines] =
    await Promise.all([
      supabase.from("workouts").select("id", { count: "exact", head: true }),
      supabase
        .from("workouts")
        .select("date")
        .gte("date", weekAgo.toISOString().split("T")[0]),
      supabase
        .from("workouts")
        .select("id, date, exercises, notes")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5),
      getRoutines(),
    ]);

  return (
    <div>
      <StatsRow
        total={count ?? 0}
        thisWeek={calculateWeekCount(weekDates ?? [])}
      />
      <StartWorkoutDialog routines={routines} />
      <RecentWorkouts workouts={(recent ?? []) as WorkoutSummary[]} />
    </div>
  );
}
