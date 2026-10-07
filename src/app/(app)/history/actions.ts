"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { WorkoutSummary } from "@/types/database";

const PAGE_SIZE = 20;

export async function getWorkoutsPage(
  offset: number,
): Promise<{ workouts: WorkoutSummary[]; total: number }> {
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("workouts")
    .select("id, date, exercises, notes", { count: "exact" })
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) throw new Error(error.message);
  return { workouts: (data ?? []) as WorkoutSummary[], total: count ?? 0 };
}

export async function deleteWorkout(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("workouts").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/history");
  revalidatePath("/dashboard");
  revalidatePath("/progress");
  revalidatePath("/profile");
}
