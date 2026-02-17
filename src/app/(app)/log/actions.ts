"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { WorkoutExercise } from "@/types/database";

export async function saveWorkout(
  exercises: WorkoutExercise[],
  unit: "kg" | "lb",
  notes: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("workouts").insert({
    user_id: user.id,
    date: new Date().toISOString().split("T")[0],
    unit,
    exercises,
    notes: notes || null,
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
    const ex = (w.exercises as WorkoutExercise[]).find(
      (e) => e.name === exerciseName,
    );
    if (ex) {
      return { sets: ex.sets, unit: w.unit || "kg", date: w.date };
    }
  }
  return null;
}

export async function getUserPreferences() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_preferences")
    .select("*")
    .single();
  return data;
}

export async function updateUnit(unit: "kg" | "lb") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase
    .from("user_preferences")
    .upsert(
      { user_id: user.id, unit, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
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
