import { createClient } from "@/lib/supabase/server";
import { HistoryList } from "./_components/history-list";
import type { Workout } from "@/types/database";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: workouts } = await supabase
    .from("workouts")
    .select("*")
    .order("date", { ascending: false });

  return <HistoryList workouts={(workouts ?? []) as Workout[]} />;
}
