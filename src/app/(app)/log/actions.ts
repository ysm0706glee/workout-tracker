"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { WorkoutExercise } from "@/types/database";

export async function saveWorkout(
  exercises: WorkoutExercise[],
  notes: string,
  routineId?: string | null,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("workouts").insert({
    user_id: user.id,
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
}

export async function getLastPerformance(exerciseName: string) {
  const supabase = await createClient();
  const { data: workouts } = await supabase
    .from("workouts")
    .select("*")
    .order("date", { ascending: false });

  if (!workouts) return null;

  for (const w of workouts) {
    const exercise = (w.exercises as WorkoutExercise[]).find(
      (e) => e.name === exerciseName,
    );
    if (exercise) {
      return { sets: exercise.sets, date: w.date };
    }
  }
  return null;
}

export async function getRoutineById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("routines")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function syncWorkout(
  localId: string,
  exercises: WorkoutExercise[],
  notes: string,
  date: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Dedup: skip if this local_id already exists for this user
  const { data: existing } = await supabase
    .from("workouts")
    .select("id")
    .eq("local_id", localId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from("workouts").insert({
    user_id: user.id,
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
}

