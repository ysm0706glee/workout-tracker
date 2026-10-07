"use server";

import { createClient, getUserId } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Exercise, Routine, WorkoutExercise } from "@/types/database";

export async function saveWorkout(
  exercises: WorkoutExercise[],
  notes: string,
  routineId?: string | null,
) {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) throw new Error("Not authenticated");

  const { error } = await supabase.from("workouts").insert({
    user_id: userId,
    date: new Date().toISOString().split("T")[0],
    unit: "kg",
    exercises,
    notes: notes || null,
    routine_id: routineId ?? null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/progress");
  revalidatePath("/profile");
}

export async function getLastPerformances(exerciseNames: string[]) {
  const supabase = await createClient();
  const result: Record<
    string,
    { sets: WorkoutExercise["sets"]; date: string } | null
  > = {};

  // One small query per exercise, in parallel: only the latest workout that
  // contains it, instead of scanning every workout for every exercise.
  await Promise.all(
    exerciseNames.map(async (name) => {
      const { data, error } = await supabase
        .from("workouts")
        .select("date, exercises")
        .contains("exercises", JSON.stringify([{ name }]))
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw new Error(error.message);
      const exercise = (data?.exercises as WorkoutExercise[] | undefined)?.find(
        (e) => e.name === name,
      );
      result[name] = exercise ? { sets: exercise.sets, date: data!.date } : null;
    }),
  );

  return result;
}

// Everything the log page needs on mount, in a single round-trip
export async function getLogInitData(routineId: string | null) {
  const supabase = await createClient();
  const [{ data: customExercises, error }, { data: routine }] =
    await Promise.all([
      supabase.from("exercises").select("*").order("name", { ascending: true }),
      routineId
        ? supabase.from("routines").select("*").eq("id", routineId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  if (error) throw new Error(error.message);
  return {
    customExercises: (customExercises ?? []) as Exercise[],
    routine: routine as Routine | null,
  };
}

export async function syncWorkout(
  localId: string,
  exercises: WorkoutExercise[],
  notes: string,
  date: string,
) {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) throw new Error("Not authenticated");

  // Dedup: skip if this local_id already exists for this user
  const { data: existing } = await supabase
    .from("workouts")
    .select("id")
    .eq("local_id", localId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from("workouts").insert({
    user_id: userId,
    local_id: localId,
    date,
    unit: "kg",
    exercises,
    notes: notes || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/progress");
  revalidatePath("/profile");
}

